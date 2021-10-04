<template lang="pug">
section.book-info
  .loading.card(v-if='bookLoading || !book') Loading...
  .card(v-if='book')
    .details.flex.gap-1
      .left
        .thumb
          lazyload.img(:src='book.thumb.fileUrl', :width='200', :height='266')
      .right.flex.flex-1(style='position: relative')
        h1.title {{ book.title }}
        .flex-column.flex-1.gap-1
          .finished
            icon
              CheckCircle(v-if='book.finished')
              PenNib(v-else)
            |
            | {{ book.finished ? "Finished" : "Writing" }}
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
    h2 Episodes
    p.loading(v-if='epsLoading || !eps') Loaading...
    .eps-list(v-if='eps')
      router-link.ep-link.plain(
        v-for='item in eps.docs',
        :to='{ name: "read", params: { bookid: bookid, epsid: item.order } }'
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

import { CheckCircle, PenNib, ThumbsUp, Heart, Eye } from '@vicons/fa'

const route = useRoute()

const bookid = ref(route.params.bookid as string)
const book = ref<any>(null)
const eps = ref<any>(null)
const bookLoading = ref(false)
const epsLoading = ref(false)
const errorTitle = ref('')
const errorMsg = ref('')

function init() {
  book.value = null
  eps.value = null
  bookLoading.value = true
  epsLoading.value = false
  errorMsg.value = ''

  axios
    .get(`${API_BASE}/fetch/comic`, {
      params: {
        id: bookid.value,
      },
    })
    .then(
      ({ data }: any) => {
        book.value = data.body
        setTitle(data.body.title, 'Book')
        getEps()
      },
      (err) => {
        errorTitle.value = 'Failed to get book info'
        errorMsg.value = getErrMsg(err)
      }
    )
    .finally(() => {
      bookLoading.value = false
    })
}

function getEps() {
  epsLoading.value = true
  axios
    .get(`${API_BASE}/fetch/comic_episodes`, {
      params: { comicId: bookid.value },
    })
    .then(
      ({ data }: any) => {
        eps.value = data.body
      },
      (err) => {
        errorTitle.value = 'Failed to get book episodes'
        errorMsg.value = getErrMsg(err)
      }
    )
    .finally(() => {
      epsLoading.value = false
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

<style scoped lang="sass">
.book-info
  .details
    margin-bottom: 1.5rem
  .left
    width: 200px
    .thumb
      .img
        width: 100%
        min-height: 260px
  .right
    flex-direction: column
    .flex-column
      display: flex
      flex-direction: column
      > div
        flex: 1
    .title
      margin: 0 0 1rem 0
      font-size: 1.6rem

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
</style>