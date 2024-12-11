<template lang="pug">
mixin pagenator
  .pagenator
    button(@click='handlePageChange(page - 1)', :disabled='page <= 1')
      icon
        arrow-left
    .page(@click='handlePagePrompt')
      .cur-page {{ page }}
      | /
      .total-page {{ totalPages }}
    button(@click='handlePageChange(page + 1)', :disabled='page >= totalPages')
      icon
        arrow-right

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
import { onMounted, ref } from 'vue'
import BooksList from '../components/BooksList.vue'
import { ArrowLeft, ArrowRight } from '@vicons/fa'
import { setTitle } from '../utils/setTitle'
import { getErrMsg } from '../utils/getErrMsg'
import { type PicaBookListItem, PicaListSort } from '../types'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { useCategoryStore } from '@/stores/category'

const route = useRoute()
const router = useRouter()
const catStore = useCategoryStore()

const category = ref('')
const page = ref(1)
const totalPages = ref(1)
const sort = ref<PicaListSort>(PicaListSort.DEFAULT)

const comics = ref<PicaBookListItem[]>([])
const loading = ref(false)
const error = ref('')

async function loadData() {
  category.value = (route.params.category as string) || ''
  page.value = parseInt(route.query.page as string) || 1
  sort.value = (route.query.sort as PicaListSort) || PicaListSort.DEFAULT

  if (category.value) {
    setTitle(`${category.value} (page ${page.value})`, 'Comics')
  } else {
    setTitle(`page ${page.value}`, 'Comics')
  }

  loading.value = true
  error.value = ''

  catStore
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

function handlePageChange(toPage: number) {
  router.push({
    query: { page: Math.min(totalPages.value, Math.max(1, toPage)) },
  })
}

function handlePagePrompt() {
  const p = prompt('Page jump to', '' + page.value) || ''
  if (!isNaN(parseInt(p))) {
    handlePageChange(parseInt(p))
  }
}

router.afterEach((to) => {
  if (to.name !== 'comics') return
  category.value = to.params.category as string
  page.value = parseInt(to.query.page as string) || 1
  loadData()
})

// Refresh when the category changes
onBeforeRouteUpdate((to, from) => {
  if (to.name !== 'comics') return
  const newCategory = to.params.category as string
  const oldCategory = from.params.category as string
  category.value = newCategory
  if (newCategory !== oldCategory) {
    page.value = parseInt(to.query.page as string) || 1
  }
  loadData()
})

onMounted(() => {
  loadData()
  setTitle('Comics')
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
