<template lang="pug">
#book-container
  section.book-info
    .bread-crumb(v-if='$route.query.backTo')
      router-link.button(:to='"" + $route.query.backTo') ← Back to {{ $route.query.backTo }}
    .loading.card.align-center(v-if='isLoadingMeta || !bookMeta')
      placeholder
    .card(v-if='bookMeta')
      .details.flex.gap-1
        .left
          e-link.no-icon.thumb(:href='bookMeta.thumb.fileUrl')
            lazyload.img(
              :src='bookMeta.thumb.fileUrl',
              :width='200',
              :height='266'
            )
        .right.flex(style='position: relative')
          .flex.title-area.flex-center
            h1.title.flex-1 {{ bookMeta.title }}
            a.bookmark.pointer(
              :class='bookMeta.isFavourite ? "is-favourite" : "not-favourite"',
              :title='bookMeta.isFavourite ? "Click to remove bookmark" : "Click to add bookmark"',
              @click='handleBookmark'
            )
              icon
                bookmark(v-if='bookMeta.isFavourite')
                bookmark-regular(v-else)
          .flex-column.flex-1.gap-1
            .finished
              icon
                CheckCircle(v-if='bookMeta.finished')
                PenNib(v-else)
              |
              | {{ bookMeta.finished ? 'Finished' : 'Writing' }}
            .pages
              strong Pages:
              | {{ bookMeta.pagesCount }} Pages, {{ bookMeta.epsCount }} Episodes
            .author
              strong Author:
              router-link(:to='"/search/" + bookMeta.author') @{{ bookMeta.author }}
            .chinese-team(v-if='bookMeta.chineseTeam')
              strong Chinese translator:
              router-link(:to='"/search/" + bookMeta.chineseTeam') {{ bookMeta.chineseTeam }}
            .tags-list
              strong Categories:
              router-link.tag(
                v-for='item in bookMeta.categories',
                :to='"/comics/" + item'
              ) {{ item }}
            .stats.flex
              .views.flex-1
                strong views:
                span {{ bookMeta.viewsCount }}
              .likes.flex-1
                strong Likes:
                span {{ bookMeta.likesCount }}
              .comments.flex-1
                strong Comments:
                span {{ bookMeta.commentsCount }}

      .tags-list
        strong Tags:
        router-link.tag(v-for='item in bookMeta.tags', :to='"/search/" + item') {{ item }}

      .description {{ bookMeta.description }}

  section.book-eps
    .card
      h2#eps Episodes
      p.loading.align-center(v-if='isLoadingEps || !bookEps.length')
        placeholder
      .eps-list(v-if='bookEps.length')
        router-link.ep-link.plain(
          v-for='item in bookEps',
          :to='{ name: "read", params: { bookid: bookid, epsid: item.order }, query: { backTo: $route.query.backTo } }'
        ) {{ item.title }}

  section.extra-actions
    .card
      h2 Extra Actions
      details
        summary Book Meta
        pre {{ bookMeta }}
      details
        summary Book Episodes
        pre {{ bookEps }}
      p(v-if='bookMeta')
        a.button.danger(@click='init(true)') Force Reload Book Info
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getErrMsg } from '../utils/getErrMsg'
import { setTitle } from '../utils/setTitle'
import { CheckCircle, PenNib, Bookmark, BookmarkRegular } from '@vicons/fa'
import type { PicaBookMeta, PicaBookEp } from '@/types'
import { useBookStore } from '@/stores/book'

const route = useRoute()

const bookid = ref(route.params.bookid as string)
const bookStore = useBookStore()
const bookMeta = ref<PicaBookMeta>()
const bookEps = ref<PicaBookEp[]>([])
const isLoadingMeta = ref(false)
const isLoadingEps = ref(false)
const errorTitle = ref('')
const errorMsg = ref('')

async function init(noCache = false) {
  bookMeta.value = undefined
  bookEps.value = []
  errorMsg.value = ''

  loadBookMeta(noCache)
  loadBookEps(noCache)
}

async function loadBookMeta(noCache = false) {
  isLoadingMeta.value = true
  return bookStore
    .getBookMeta(bookid.value, noCache)
    .then((meta) => {
      bookMeta.value = meta
      setTitle(meta.title, 'Book')
      return bookMeta.value
    })
    .catch((err: any) => {
      errorTitle.value = 'Failed to get book info'
      errorMsg.value = getErrMsg(err)
    })
    .finally(() => {
      isLoadingMeta.value = false
    })
}

async function loadBookEps(noCache = false): Promise<PicaBookEp[]> {
  isLoadingEps.value = true
  return bookStore
    .getBookEps(bookid.value, noCache)
    .then((list) => {
      bookEps.value = list
      return list
    })
    .catch((err: any) => {
      errorTitle.value = 'Failed to get book episodes'
      errorMsg.value = getErrMsg(err)
      return Promise.reject(err)
    })
    .finally(() => {
      isLoadingEps.value = false
    })
}

let bookmarkLoading = false
function handleBookmark() {
  if (bookmarkLoading || !bookMeta.value) return
  bookmarkLoading = true
  bookStore
    .toggleBookmark(bookid.value)
    .then(
      (added) => {
        bookMeta.value!.isFavourite = added
      },
      (err) => {
        console.warn('Faild to set favourite status')
      }
    )
    .finally(() => {
      bookmarkLoading = false
    })
}

watch(bookid, () => {
  init()
})

onMounted(() => {
  setTitle('Book')
  init()
})
</script>

<style lang="sass">
#book-container
  display: flex
  flex-direction: column
  gap: 1rem

.book-info
  .details
    margin-bottom: 1.5rem
  .left
    width: 200px
    flex: 1
    .thumb
      .img
        width: 100%
        height: auto
  .right
    flex: 3
    flex-direction: column
    .flex-column
      display: flex
      flex-direction: column
      > div
        flex: 1
    .title
      margin: 0 0 1rem 0
      font-size: 1.6rem
    .bookmark
      font-size: 1.4rem
      &.is-favourite
        --color: var(--theme-bookmark-color)
      &.not-favourite
        --color: #aaa

.book-eps
  .eps-list
    display: flex
    flex-wrap: wrap
    gap: 0.5rem
    .ep-link
      display: block
      --color: var(--theme-accent-color)
      padding: 0.5rem 1rem
      border-radius: 4px
      box-shadow: 0 0 0 1px var(--theme-accent-color)

@media (max-width: 600px)
  .book-info
    .details
      flex-direction: column
      .left
        width: 100%
        text-align: center
        // a
        //   display: block
        .lazyload
          width: 320px
          max-width: 100%
          height: auto
</style>
