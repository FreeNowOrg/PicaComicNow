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
      h1 {{ curEp?.title || 'Loading...' }}
    router-link.button.flex-center(
      v-if='nextEp',
      :to='{ name: "read", params: { bookid, epsid: nextEp.order } }'
    )
      | {{ nextEp?.title || 'Next' }}
      icon: chevron-right

  .pages-list
    .align-center(v-if='!pages.length')
      placeholder
    .page(v-else, v-for='(item, index) in pages', :id='"page-" + (index + 1)')
      .page-tag-container(:href='"#page-" + index')
        .page-tag {{ index + 1 }}
      Lazyload.page-img(:src='item.media.fileUrl', :key='item.id')

  p.align-center(v-if='pagesLeft > 0 && pages.length')
    a.pointer.button(@click='loadPages()') {{ isLoadingPages ? 'Loading...' : 'See more' }} ({{ pagesLeft }} pages left)

  .book-eps(v-if='bookEps.length && pages.length')
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
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { setTitle } from '../utils/setTitle'
import type { PicaBookMeta, PicaBookPage, PicaBookEp } from '@/types'
import { ChevronLeft, ChevronRight, ArrowLeft } from '@vicons/fa'
import { useBookStore } from '@/stores/book'

const route = useRoute()
const bookStore = useBookStore()

const bookid = ref(route.params.bookid as string)
const epsid = ref(route.params.epsid as string)

const pages = ref<PicaBookPage[]>([])
const pagesLeft = ref(0)
const nextPagination = ref(1)
const isLoadingPages = ref(false)

async function loadPages() {
  if (isLoadingPages.value) {
    return
  }
  if (pages.value.length && pagesLeft.value <= 0) {
    return
  }
  isLoadingPages.value = true

  const scrollTop = document.documentElement.scrollTop
  console.log('before', scrollTop)

  bookStore
    .getBookPages(bookid.value, epsid.value, nextPagination.value)
    .then((data) => {
      console.log(data)

      pages.value = [...pages.value, ...data.docs]
      pagesLeft.value = data.totalDocs - pages.value.length
      nextPagination.value = data.pagination + 1

      console.log('after', {
        from: document.documentElement.scrollTop,
        to: scrollTop,
      })
      document.documentElement.scrollTop = scrollTop
    })
    .finally(() => {
      isLoadingPages.value = false
    })
}

const bookMeta = ref<PicaBookMeta | null>(null)
async function setupBookMeta() {
  bookMeta.value = await bookStore.getBookMeta(bookid.value)
}

const bookEps = ref<PicaBookEp[]>([])
const orderedEps = computed(() => {
  return bookEps.value.sort((a, b) => a.order - b.order)
})
const prevEp = computed(() => {
  return bookEps.value?.find((item) => item.order === +epsid.value - 1)
})
const nextEp = computed(() => {
  return bookEps.value?.find((item) => item.order === +epsid.value + 1)
})
const curEp = computed(() => {
  return bookEps.value?.find((item) => item.order === +epsid.value)
})
async function setupBookEps() {
  bookEps.value = await bookStore.getBookEps(bookid.value)
}

watch([bookMeta, curEp], ([meta, ep]) => {
  if (meta && ep) {
    setTitle(ep.title, meta.title)
  }
})

function resetAll() {
  setTitle('Loading pages...')

  pages.value = []
  pagesLeft.value = 0
  nextPagination.value = 1
  isLoadingPages.value = false

  setupBookMeta()
  setupBookEps()

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
    .page-img
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
