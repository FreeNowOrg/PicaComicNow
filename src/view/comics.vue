<template lang="pug">
.bread-crumb
  router-link.button(to='/categories') 
    icon
      arrow-left
    | Categories list

h1(v-if='category') Category: {{ category }} (page {{ page }})
h1(v-else) Comics list (page {{ page }})

.loading(v-if='loading') Loading...

.info.error(v-if='error')
  .title Failed to get comics data
  p {{ error }}

.card
  details
    pre {{ comics }}

section(v-if='comics.docs && comics.docs.length')
  books-list(:data='comics.docs')
</template>

<script setup lang="ts">
import axios from 'axios'
import { defineComponent, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@vicons/fa'
import { API_BASE } from '../config'
import { setTitle } from '../utils/setTitle'
const route = useRoute()
const router = useRouter()

import BooksList from '../components/BooksList.vue'
const components = defineComponent({ BooksList })

type SortTypes = 'ua' | 'dd' | 'da' | 'ld' | 'vd'
const category = ref('')
const page = ref(1)
const sort = ref<SortTypes>('ua')

const comics = ref<any>({})
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
    setTitle(category.value, 'Comics')
  } else {
    setTitle('Comics')
  }

  loading.value = true
  error.value = ''

  axios
    .get(`${API_BASE}/fetch/comics`, {
      params: { category: category.value, page: page.value, sort: sort.value },
    })
    .then(
      ({ data }: any) => {
        comics.value = data.body
      },
      (err) => {
        console.warn('Failed to get comics data', err)
        error.value =
          err?.response?.data?.message || err.message || 'HTTP Timeout'
      }
    )
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  init()
})
</script>

<style scoped lang="sass"></style>