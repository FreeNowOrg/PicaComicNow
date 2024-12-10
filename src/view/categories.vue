<template lang="pug">
mixin thumb(item)
  .thumb
    lazyload.img(:src='item.thumb.fileUrl')
    .title
      | {{ item.title }}
      icon(v-if='item.isWeb', style='float: right')
        external-link-alt

#categories-container
  h1 Categories Index

  .loading.align-center(v-if='loading')
    placeholder

  .info.error(v-if='error')
    .title Failed to get categories data
    p {{ error }}

  ul.categories-list
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
import { getErrMsg } from '../utils/getErrMsg'
import { setTitle } from '../utils/setTitle'
import { ExternalLinkAlt } from '@vicons/fa'
import type { ApiResponseCategories, PicaCategory } from '@/types'
import { useCategoryStore } from '@/stores/category'

const catStore = useCategoryStore()
const list = ref<PicaCategory[]>([])
const error = ref('')
const loading = ref(false)

// import * as data from './categories.dev.json'

function init() {
  loading.value = true
  error.value = ''

  catStore
    .fetchCategoriesIndex()
    .then(
      (data) => {
        list.value = data
      },
      (err) => {
        console.warn('Failed to get categories data', err)
        error.value = getErrMsg(err)
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

<style lang="sass">
.categories-list
  list-style: none
  padding-left: 0
  display: flex
  gap: 1.5rem
  flex-wrap: wrap
  justify-content: center

  li
    max-width: 240px
    width: calc(50% - 1rem)

  .card
    position: relative
    line-height: 0
    padding: 0
    > a
      width: 100%
    .thumb
      position: relative
      overflow: hidden
      width: 100%
      height: 0
      padding-top: 100%
      .lazyload
        position: absolute
        top: 0
        left: 0
        display: block
        width: 100%
        height: 100%
        transition: all 0.24s ease
        transform: scale(1)
      &:hover img
        transform: scale(1.1)
      .title
        position: absolute
        font-weight: 600
        font-size: 1.2rem
        color: #fff
        text-shadow: 0 0 4px #444
        background-color: rgba(0, 0, 0, 0.5)
        left: 0
        bottom: 0
        padding: 0.4rem 1rem
        width: 100%
        line-height: 1
</style>
