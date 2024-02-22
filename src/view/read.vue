<template lang="pug">
#read-container
  .bread-crumb
    router-link.button(
      :to='{ name: "book", params: { bookid }, query: { backTo: $route.query.backTo } }'
    ) 
      icon(style='margin-right: 0.5rem'): arrow-left
      | Back to {{ bookMeta ? `《${bookMeta.title}》` : 'book' }}

  .ep-pagination.flex.gap-1
    router-link.button.flex.flex-center(
      v-if='prevEp',
      :to='{ name: "read", params: { bookid, epsid: prevEp.order } }'
    )
      icon: chevron-left
      | {{ prevEp?.title || 'Previous' }}
    .ep-title.flex-1
      h1 {{ title || 'Loading...' }}
    router-link.button.flex-center(
      v-if='nextEp',
      :to='{ name: "read", params: { bookid, epsid: nextEp.order } }'
    )
      | {{ nextEp?.title || 'Next' }}
      icon: chevron-right

  .pages-list
    .page(v-for='(item, index) in docs', :id='"page-" + (index + 1)')
      .page-tag-container(:href='"#page-" + index')
        .page-tag {{ index + 1 }}
      lazyload.img(:src='item.media.fileUrl')

  p.align-center(v-if='hasNext > 0')
    a.pointer.button(@click='loadPages()') {{ nextLoading ? 'Loading...' : 'See more' }} ({{ hasNext }} pages left)

  .book-eps(v-if='bookEps.length && docs.length')
    .next-ep(v-if='nextEp', style='text-align: center')
      router-link.button(
        :to='{ name: "read", params: { bookid, epsid: nextEp.order } }'
      )
        | {{ nextEp.title }}
        icon: chevron-right 

    h2 Episodes
    .eps-list
      router-link.ep-link(
        v-for='item in orderedEps',
        :to='{ name: "read", params: { bookid, epsid: item.order } }'
      ) {{ item.title }}
</template>

<script setup lang="ts">
import axios from 'axios'
import { computed, onMounted, ref } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { API_BASE } from '../config'
import { setTitle } from '../utils/setTitle'
import type {
  ApiResponseComicPages,
  ComicDetails,
  ComicPagesItem,
  EpsItem,
} from '@/types'
import {
  useBookEpsStore,
  useBookMetaStore,
  useBookPagesStore,
} from '@/utils/caches'
import { ChevronLeft, ChevronRight, ArrowLeft } from '@vicons/fa'

const route = useRoute()

const bookid = ref(route.params.bookid as string)
const epsid = ref(route.params.epsid as string)

const title = ref('')
const docs = ref<ComicPagesItem[]>([])

const hasNext = ref(0)
const nextPage = ref(1)
const nextLoading = ref(false)

function setupCachedPages() {
  const store = useBookPagesStore(bookid.value, epsid.value)
  const data = store.getItem()
  const pageLength = data?.docs?.length || 0
  if (data && pageLength) {
    docs.value = data.docs
    nextPage.value = data.loadedPagination + 1
    hasNext.value = data.totalPagination - data.loadedPagination
    setTitle(data.ep.title, bookMeta.value?.title || 'Read')
    title.value = data.ep.title
  }
}
function loadPages() {
  if (nextLoading.value) {
    return
  }
  if (docs.value.length && !hasNext.value) {
    return
  }
  if (nextPage.value > 1) {
    nextLoading.value = true
  }

  const scrollTop = document.documentElement.scrollTop
  console.log('before', scrollTop)

  axios
    .get<ApiResponseComicPages>(
      `${API_BASE}/comics/${bookid.value}/order/${epsid.value}/pages`,
      {
        params: {
          page: nextPage.value,
        },
      }
    )
    .then(({ data }) => {
      console.log(data)
      const { body } = data

      setTitle(body.ep.title, bookMeta.value?.title || 'Read')
      docs.value = [...docs.value, ...body.pages.docs]
      title.value = body.ep.title

      hasNext.value = body.pages.total - body.pages.page * body.pages.limit
      nextPage.value = body.pages.page + 1

      console.log('after', {
        from: document.documentElement.scrollTop,
        to: scrollTop,
      })
      document.documentElement.scrollTop = scrollTop

      const store = useBookPagesStore(bookid.value, epsid.value)
      store.setItem({
        ep: body.ep,
        docs: docs.value,
        loadedPagination: body.pages.page,
        totalPagination: body.pages.pages,
        total: body.pages.total,
      })
    })
    .finally(() => {
      nextLoading.value = false
    })
}

const bookMeta = ref<ComicDetails | null>(null)
function setupBookMeta() {
  const bookStore = useBookMetaStore(bookid.value)
  const bookData = bookStore.getItem()
  if (bookData) {
    bookMeta.value = bookData
  }
}

const bookEps = ref<EpsItem[]>([])
const orderedEps = computed(() => {
  return bookEps.value.sort((a, b) => a.order - b.order)
})
const prevEp = computed(() => {
  return bookEps.value?.find((item) => item.order === +epsid.value - 1)
})
const nextEp = computed(() => {
  return bookEps.value?.find((item) => item.order === +epsid.value + 1)
})
function setupBookEps() {
  const epsStore = useBookEpsStore(bookid.value)
  const epsData = epsStore.getItem()
  if (epsData && epsData.length) {
    bookEps.value = epsData
  }
}

function resetAll() {
  setTitle('Read')

  docs.value = []
  hasNext.value = 0
  nextPage.value = 1
  nextLoading.value = false

  setupBookMeta()
  setupBookEps()

  setupCachedPages()
  loadPages()
}

onMounted(() => {
  resetAll()
})
onBeforeRouteUpdate((to, from, next) => {
  if (
    to.params.bookid !== from.params.bookid ||
    to.params.epsid !== from.params.epsid
  ) {
    bookid.value = to.params.bookid as string
    epsid.value = to.params.epsid as string
    resetAll()
    next()
  }
})
</script>

<style lang="sass">
.ep-pagination
  margin: 1rem 0
  item-align: center
  justify-content: center
  h1
    margin: 0
    font-size: 1.75rem

.pages-list
  width: 70%
  max-width: 600px
  margin: 0 auto
  .page
    position: relative
    .lazyload
      width: 100%
      &[data-lazy-state="loading"]
        min-height: 45vh
    .page-tag-container
      pointer-events: none
      position: absolute
      top: 0
      left: 0
      height: 100%
      .page-tag
        position: sticky
        top: calc(50px + 0.5rem)
        margin-bottom: 0.5rem
        margin-left: -2rem
        line-height: 1.6
        text-align: center
        width: 1.6em
        height: 1.6em
        background-color: var(--theme-accent-color)
        color: #fff
        border-radius: 50%

@media (max-width: 600px)
  .pages-list
    width: unset
    max-width: unset
    margin: 0
    .page
      .page-tag-container
        .page-tag
          margin-top: 0.5rem
          margin-left: 0.5rem

.book-eps
  margin-top: 1.5rem
  .eps-list
    display: flex
    flex-wrap: wrap
    gap: 0.5rem
    .ep-link
      display: block
      --color: var(--theme-accent-color)
      padding: 0.25rem 1rem
      border-radius: 4px
      box-shadow: 0 0 0 1px var(--theme-accent-color)
      &.router-link-active
        --color: #fff
        background-color: var(--theme-accent-color)
</style>
