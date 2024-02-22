<template lang="pug">
#book-container
  section.book-info
    .bread-crumb(v-if='$route.query.backTo')
      router-link.button(:to='$route.query.backTo') ← Back to {{ $route.query.backTo }}
    .loading.card.align-center(v-if='bookLoading || !book')
      placeholder
    .card(v-if='book')
      .details.flex.gap-1
        .left
          e-link.no-icon.thumb(:href='book.thumb.fileUrl')
            lazyload.img(
              :src='book.thumb.fileUrl',
              :width='200',
              :height='266'
            )
        .right.flex(style='position: relative')
          .flex.title-area.flex-center
            h1.title.flex-1 {{ book.title }}
            a.bookmark.pointer(
              :class='book.isFavourite ? "is-favourite" : "not-favourite"',
              :title='book.isFavourite ? "Click to remove bookmark" : "Click to add bookmark"',
              @click='handleBookmark'
            )
              icon
                bookmark(v-if='book.isFavourite')
                bookmark-regular(v-else)
          .flex-column.flex-1.gap-1
            .finished
              icon
                CheckCircle(v-if='book.finished')
                PenNib(v-else)
              |
              | {{ book.finished ? 'Finished' : 'Writing' }}
            .pages
              strong Pages:
              | {{ book.pagesCount }} Pages, {{ book.epsCount }} Episodes
            .author
              strong Author:
              router-link(:to='"/search/" + book.author') @{{ book.author }}
            .chinese-team
              strong Chinese translator:
              router-link(:to='"/search/" + book.chineseTeam') {{ book.chineseTeam }}
            .tags-list
              strong Categories:
              router-link.tag(
                v-for='item in book.categories',
                :to='"/comics/" + item'
              ) {{ item }}
            .stats.flex
              .likes.flex-1
                strong Likes
                span {{ book.likesCount }}
              .views.flex-1
                strong views
                span {{ book.viewsCount }}

      .tags-list
        strong Tags:
        router-link.tag(v-for='item in book.tags', :to='"/search/" + item') {{ item }}

      .description {{ book.description }}

      details
        pre {{ book }}

  section.book-eps
    .card
      h2#eps Episodes
      p.loading.align-center(v-if='epsLoading || !eps.length')
        placeholder
      .eps-list(v-if='eps.length')
        router-link.ep-link.plain(
          v-for='item in eps',
          :to='{ name: "read", params: { bookid: bookid, epsid: item.order }, query: { backTo: $route.query.backTo } }'
        ) {{ item.title }}
      details
        pre {{ eps }}
</template>

<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { API_BASE } from '../config'
import { getErrMsg } from '../utils/getErrMsg'
import { setTitle } from '../utils/setTitle'
import { CheckCircle, PenNib, Bookmark, BookmarkRegular } from '@vicons/fa'
import type {
  ApiResponseComicEps,
  ApiResponseComicInfo,
  EpsItem,
} from '@/types'
import { useBookEpsStore, useBookMetaStore } from '@/utils/caches'

const route = useRoute()

const bookid = ref(route.params.bookid as string)
const book = ref<any>(null)
const eps = ref<any[]>([])
const bookLoading = ref(false)
const epsLoading = ref(false)
const errorTitle = ref('')
const errorMsg = ref('')

async function init() {
  book.value = null
  eps.value = []
  errorMsg.value = ''

  loadDetails()
  loadEps()
}

async function loadDetails() {
  const store = useBookMetaStore(bookid.value)
  const cachedData = store.getItem()
  if (cachedData) {
    book.value = cachedData
    bookLoading.value = false
    return
  }

  bookLoading.value = true
  return axios
    .get<ApiResponseComicInfo>(`${API_BASE}/comics/${bookid.value}`)
    .then(({ data }) => {
      book.value = data.body.comic
      setTitle(data.body.comic.title, 'Book')
      store.setItem(data.body.comic)
      return book.value
    })
    .catch((err: any) => {
      errorTitle.value = 'Failed to get book info'
      errorMsg.value = getErrMsg(err)
    })
    .finally(() => {
      bookLoading.value = false
    })
}

async function loadEps(): Promise<EpsItem[]> {
  const store = useBookEpsStore(bookid.value)
  const cachedData = store.getItem()
  if (cachedData && cachedData.length) {
    eps.value = cachedData
    epsLoading.value = false
    return cachedData
  }

  async function mainLoop(page = 1): Promise<void> {
    return axios
      .get<ApiResponseComicEps>(`${API_BASE}/comics/${bookid.value}/eps`, {
        params: {
          page,
        },
      })
      .then(({ data }) => {
        const epsData = data.body.eps
        eps.value = [...eps.value, ...epsData.docs]
        if (epsData.page < epsData.pages) {
          return mainLoop(data.body.eps.page + 1)
        }
      })
  }

  epsLoading.value = true
  return await mainLoop(1)
    .then(() => {
      if (eps.value.length) {
        store.setItem(eps.value)
      }
      return eps.value
    })
    .finally(() => {
      epsLoading.value = false
    })
}

let bookmarkLoading = false
function handleBookmark() {
  if (bookmarkLoading) return
  bookmarkLoading = true
  axios
    .post(`${API_BASE}/comics/${bookid.value}/favourite`)
    .then(
      ({ data }: any) => {
        if (data.body.action === 'favourite') {
          book.value.isFavourite = true
        } else if (data.body.action === 'un_favourite') {
          book.value.isFavourite = false
        }
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
  margin-top: 1.5rem
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
