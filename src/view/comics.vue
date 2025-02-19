<template lang="pug">
mixin pagenator
  book-list-paginator(v-model:page='page', v-model:sort='sort', :total-pages)

#comics-container
  .bread-crumb
    router-link.button(to='/categories') 
      icon
        arrow-left
      |
      | Categories Index

  h1(v-if='category') Comics in {{ category }}
  h1(v-else) Comics list

  .mbox.error(v-if='error')
    .title Failed to get comics data
    p {{ error }}

  .loading.align-center(v-if='loading && !comics.length')
    placeholder

  section(v-if='comics.length', :class='{ "loading-cover": loading }')
    +pagenator
    books-list(:data='comics', :backTo='"/comics/" + category')
    +pagenator
</template>

<script setup lang="ts">
import { computed, effect, onMounted, ref, watch } from 'vue'
import BooksList from '../components/BooksList.vue'
import { ArrowLeft, ArrowRight } from '@vicons/fa'
import { setTitle } from '../utils/setTitle'
import { getErrMsg } from '../utils/getErrMsg'
import { type PicaBookListItem, PicaListSort } from '../types'
import { useRoute, useRouter } from 'vue-router'
import { useCategoryStore } from '@/stores/category'
import BookListPaginator from '@/components/BookListPaginator.vue'

const route = useRoute()
const router = useRouter()
const catStore = useCategoryStore()

const category = computed(() => route.params.category as string)
const page = ref(1)
const totalPages = ref(1)
const sort = ref<PicaListSort>(PicaListSort.DEFAULT)

const comics = ref<PicaBookListItem[]>([])
const loading = ref(false)
const error = ref('')

onMounted(() => {
  setTitle('Comics')

  page.value = parseInt(route.query.page as string) || 1
  sort.value = (route.query.sort as PicaListSort) || PicaListSort.DEFAULT

  loadData()
})

async function loadData() {
  if (loading.value) return

  if (!category.value) {
    error.value = 'Category not specified'
    return
  }

  setTitle(`${category.value} (page ${page.value})`, 'Comics')
  router.push({
    params: {
      category: category.value,
    },
    query: { page: page.value, sort: sort.value },
  })

  loading.value = true
  error.value = ''

  return catStore
    .fetchBooksInCategory(category.value, page.value, sort.value)
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

watch([category, page, sort], ([nCat, nPage, nSort], [cat, pg, srt]) => {
  if (nCat !== cat) {
    page.value = 1
  }
  loadData()
})
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
