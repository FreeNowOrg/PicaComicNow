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
    
    select(v-model="route.query.sort" @change="changeSort")
      option(value="ua") 默认
      option(value="dd") 新到旧
      option(value="da") 旧到新
      option(value="ld") 最多爱心
      option(value="vd") 最多绅士指名次数

  h1(v-if='category') Comics in {{ category }}
  h1(v-else) Comics list

  .info.error(v-if='error')
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
import axios from 'axios'
import { defineComponent, onMounted, ref, watch } from 'vue'
import BooksList from '../components/BooksList.vue'
import { ArrowLeft, ArrowRight } from '@vicons/fa'
import { API_BASE } from '../config'
import { setTitle } from '../utils/setTitle'
import { getErrMsg } from '../utils/getErrMsg'
import type { ApiResponseComics, ComicListItem } from '../types'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()

// const components = defineComponent({ BooksList })

type SortTypes = 'ua' | 'dd' | 'da' | 'ld' | 'vd'
const category = ref('')
const page = ref(1)
const totalPages = ref(1)
const sort = ref<SortTypes>('ua')

route.query.sort = 'ua'

const comics = ref<ComicListItem[]>([])
const loading = ref(false)
const error = ref('')

// Refresh when the category changes
router.afterEach((to, from) => {
  console.log('after route', { to })
  if (to.name === from.name && to !== from) {
    category.value = route.params.category as string
  }
})

/**
 * @param arg1.category 分区名字，categories里面的title，如"嗶咔漢化"
 * @param arg1.page 分页，从1开始
 * @param arg1.sort 排序依据：
 * ```
 * ua: 默认
 * dd: 新到旧
 * da: 旧到新
 * ld: 最多爱心
 * vd: 最多指名
 * ```
 */
function init() {
  category.value = (route.params.category as string) || ''
  page.value = parseInt(route.query.page as string) || 1
  sort.value = (route.query.sort as SortTypes) || 'ua'

  if (category.value) {
    setTitle(`${category.value} (page ${page.value})`, 'Comics')
  } else {
    setTitle(`page ${page.value}`, 'Comics')
  }

  loading.value = true
  error.value = ''

  axios
    .get<ApiResponseComics>(`${API_BASE}/comics`, {
      params: {
        c: category.value,
        // t: '',
        page: page.value,
        s: sort.value,
      },
    })
    .then(
      ({ data }) => {
        comics.value = data.body?.comics.docs
        totalPages.value = data.body?.comics.pages
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

function changeSort(){
  init()
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
  route.query.sort = sort.value
  init()
})

onMounted(() => {
  init()
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
.bread-crumb 
  select
    float: right
    margin-left: 10px
    background-color: #f1f1f1
    border: 1px solid #ccc
    border-radius: 4px
    padding: 5px
    margin-left: 10px
    background-color: #ffedf0
</style>
