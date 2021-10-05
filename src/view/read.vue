<template lang="pug">
.bread-crumb
  router-link.button(
    :to='{ name: "book", params: { bookid }, query: { category: $route.query.category } }'
  ) ← Back to book

h1 {{ title || "Loading..." }}

.pages-list
  .page(v-for='(item, index) in docs', :id='"page-" + (index + 1)')
    .page-tag-container(:href='"#page-" + index')
      .page-tag {{ index + 1 }}
    lazyload.img(:src='item.media.fileUrl')

p.align-center(v-if='hasNext > 0')
  a.pointer.button(@click='getPage()') {{ nextLoading ? "Loading..." : "See more" }} ({{ hasNext }} pages left)
</template>

<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { API_BASE } from '../config'
import { setTitle } from '../utils/setTitle'

const route = useRoute()

const bookid = ref(route.params.bookid as string)
const epsid = ref(route.params.epsid as string)

const title = ref('')
const docs = ref<any[]>([])

const hasNext = ref(0)
const nextPage = ref(1)
const nextLoading = ref(false)

function getPage() {
  if (nextLoading.value) {
    return
  }
  if (nextPage.value > 1) {
    nextLoading.value = true
  }

  const scrollTop = document.documentElement.scrollTop
  console.log('before', scrollTop)

  axios
    .get(`${API_BASE}/fetch/ComicEpisodePages`, {
      params: {
        comicId: bookid.value,
        epsOrder: epsid.value,
        page: nextPage.value,
      },
    })
    .then(({ data }: any) => {
      console.log(data)
      const { body } = data

      setTitle(body.ep.title, 'Read')
      docs.value = [...docs.value, ...body.pages.docs]
      title.value = body.ep.title

      hasNext.value = body.pages.total - body.pages.page * body.pages.limit
      nextPage.value = body.pages.page + 1

      console.log('after', {
        from: document.documentElement.scrollTop,
        to: scrollTop,
      })
      document.documentElement.scrollTop = scrollTop
    })
    .finally(() => {
      nextLoading.value = false
    })
}

onMounted(() => {
  getPage()
  setTitle('Read')
})
</script>

<style lang="sass">
.pages-list
  width: 70%
  max-width: 1080px
  margin: 0 auto
  .page
    position: relative
    .img
      width: 100%
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

@media screen and(max-width: 800px)
  .pages-list
    width: unset
    max-width: unset
    margin: 0
    .page
      .page-tag-container
        .page-tag
          margin-top: 0.5rem
          margin-left: 0.5rem
</style>