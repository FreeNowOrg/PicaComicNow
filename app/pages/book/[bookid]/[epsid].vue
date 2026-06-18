<template lang="pug">
#read-container
  .bread-crumb
    NuxtLink(to='/') 首页
    NuxtLink(:to='"/book/" + bookid') {{ bookMeta ? bookMeta.title : '...' }}
    span(v-if='curEp') {{ curEp.title }}

  .ep-pagination
    NuxtLink.pica-btn.bg-cream.ep-nav-btn(
      v-if='prevEp',
      :to='"/book/" + bookid + "/" + prevEp.order'
    )
      i.i-fa6-solid-chevron-left
      | {{ prevEp?.title || '上一话' }}
    .ep-title
      h1 {{ curEp?.title || '加载中...' }}
    NuxtLink.pica-btn.bg-cream.ep-nav-btn(
      v-if='nextEp',
      :to='"/book/" + bookid + "/" + nextEp.order'
    )
      | {{ nextEp?.title || '下一话' }}
      i.i-fa6-solid-chevron-right

  .pages-list
    .align-center(v-if='!pages.length')
      placeholder
    .page(v-else, v-for='(item, index) in pages', :id='"page-" + (index + 1)')
      .page-tag-container(:href='"#page-" + index')
        .page-tag {{ index + 1 }}
      Lazyload.page-img(:src='item.media.fileUrl', :key='item.id')

  p.align-center(v-if='pagesLeft > 0 && pages.length')
    PicaButton(@click='loadPages()')
      | {{ isLoadingPages ? '加载中...' : '加载更多' }} ({{ pagesLeft }} 页剩余)

  .book-eps(v-if='bookEps.length && pages.length')
    .next-ep(v-if='nextEp', style='text-align: center')
      NuxtLink.pica-btn.bg-brand-pink.text-white(
        :to='"/book/" + bookid + "/" + nextEp.order'
      )
        | {{ nextEp.title }}
        i.i-fa6-solid-chevron-right

    h2 章节列表
    EpsList(:eps='orderedEps', :book-id='bookid')
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { setTitle } from '~/utils/setTitle'
import type { PicaBookMeta, PicaBookPage, PicaBookEp } from '~/types'
import { useBookStore } from '~/stores/book'

definePageMeta({
  name: 'read',
  alias: ['/read/:bookid/:epsid'],
})

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

<style lang="scss">
// Episode pagination navigation
.ep-pagination {
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  align-items: center;
  justify-content: center;

  h1 {
    margin: 0;
    font-family: 'Archivo Black', 'Noto Sans SC', system-ui, sans-serif;
    font-size: 1.5rem;
  }

  .ep-title {
    flex: 1;
    text-align: center;
  }

  .ep-nav-btn {
    font-size: 0.875rem;
    padding: 0.5rem 1rem;
    white-space: nowrap;
  }
}

// Reader pages area
.pages-list {
  width: 70%;
  max-width: 600px;
  margin: 0 auto;
  border: 3px solid #000;
  border-radius: 0;
  // overflow: hidden;
  background-color: #fff;

  .page {
    position: relative;

    .page-img {
      width: 100%;

      &[data-lazy-state="loading"] {
        min-height: 45vh;
      }
    }

    .page-tag-container {
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;

      .page-tag {
        position: sticky;
        top: calc(62px + 0.5rem);
        margin-bottom: 0.5rem;
        margin-left: -2rem;
        line-height: 1.2s;
        text-align: center;
        width: 1.6em;
        height: 1.6em;
        background-color: #FF5C8A;
        color: #fff;
        border: 2px solid #000;
        border-radius: 0;
        font-weight: 700;
        font-size: 0.875rem;
        box-shadow: 2px 2px 0 0 #000;
      }
    }
  }
}

@media (max-width: 600px) {
  .pages-list {
    width: unset;
    max-width: unset;
    margin: 0;
    border-left: none;
    border-right: none;
    border-radius: 0;

    .page {
      .page-tag-container {
        .page-tag {
          margin-top: 0.5rem;
          margin-left: 0.5rem;
        }
      }
    }
  }

  .ep-pagination {
    flex-wrap: wrap;

    .ep-nav-btn {
      font-size: 0.8rem;
      padding: 0.4rem 0.75rem;
    }
  }
}

// Episode list in reader page
.book-eps {
  margin-top: 1.5rem;

  .next-ep {
    margin-bottom: 1rem;
  }

}
</style>
