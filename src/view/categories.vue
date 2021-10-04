<template lang="pug">
mixin thumb(item)
  .thumb
    lazyload.img(:src='item.thumb.fileUrl', :width='200', :height='200')
    .title {{ item.title }}

h1 Categories

.loading(v-if='loading') Loading...

.info.error(v-if='error')
  .title Failed to get categories data
  p {{ error }}

.card
  details
    pre {{ list }}

ul.list
  li(v-for='item in list')
    .card(v-if='item.active !== false')
      e-link.no-icon(v-if='item.isWeb', :href='item.link')
        +thumb(item)
      router-link(v-else, :to='"/comics/" + item.title')
        +thumb(item)
</template>

<script setup lang="ts">
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { API_BASE } from '../config'
import { setTitle } from '../utils/setTitle'

const list = ref<any[]>([])
const error = ref('')
const loading = ref(false)

// import * as data from './categories.dev.json'

function init() {
  loading.value = true
  error.value = ''
  // list.value = data.body
  // return

  axios
    .get(`${API_BASE}/fetch/categories`)
    .then(
      ({ data }: any) => {
        list.value = data.body
      },
      (err) => {
        console.warn('Failed to get categories data', err)
        error.value =
          err?.response?.data?.message || err.message || 'HTTP Timeout'
      }
    )
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  setTitle('All Categories')
  init()
})
</script>

<style scoped lang="sass">
.list
  list-style: none
  padding-left: 0
  display: flex
  gap: 1.5rem
  flex-wrap: wrap
  justify-content: center

  .card
    position: relative
    .thumb
      position: relative
      overflow: hidden
      .img
        display: block
        width: 200px
        height: 200px
        transition: all 0.24s ease
      &:hover img
        transform: scale(1.1)
      .title
        position: absolute
        font-weight: 600
        font-size: 1.2rem
        color: #fff
        text-shadow: 0 0 4px #444
        background-color: rgba(0, 0, 0, 0.25)
        left: 0
        bottom: 0
        padding: 0.4rem 1rem
        width: 100%
        line-height: 1
</style>