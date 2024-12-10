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

#favourite-container
  .bread-crumb
    router-link.button(to='/profile') 
      icon
        arrow-left
      |
      | Profile

  h1 My Favourites

  .info.error(v-if='error')
    .title Failed to get list
    p {{ error }}

  .loading.align-center(v-if='loading && !comics.length')
    placeholder

  section(v-if='comics.length', :class='{ "loading-cover": loading }')
    +pagenator
    books-list(:data='comics', :backTo='"/favourite"')
    +pagenator
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ArrowLeft, ArrowRight } from '@vicons/fa'
import BooksList from '../components/BooksList.vue'
import { setTitle } from '../utils/setTitle'
import { getErrMsg } from '../utils/getErrMsg'
import { useRoute, useRouter } from 'vue-router'
import type { PicaBookListItem } from '@/types'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const user = useUserStore()

type SortTypes = 'ua' | 'dd' | 'da' | 'ld' | 'vd'
const page = ref(1)
const totalPages = ref(1)
const sort = ref<SortTypes>('dd')

const comics = ref<PicaBookListItem[]>([])
const loading = ref(false)
const error = ref('')

function init() {
  page.value = parseInt(route.query.page as string) || 1
  sort.value = (route.query.sort as SortTypes) || 'dd'

  loading.value = true
  error.value = ''

  user
    .fetchFavoriteBooks({
      sort: sort.value,
      page: page.value,
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

function handlePageChange(toPage: number) {
  router.push({
    query: {
      page: Math.min(totalPages.value, Math.max(1, toPage)),
    },
  })
}

function handlePagePrompt() {
  const p = prompt('Page jump to', '' + page.value) || ''
  if (!isNaN(parseInt(p))) {
    handlePageChange(parseInt(p))
  }
}

router.afterEach((to) => {
  if (to.name !== 'favourite') return
  page.value = parseInt(to.query.page as string) || 1
  init()
})

onMounted(() => {
  init()
  setTitle('Favourites')
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
