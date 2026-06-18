<template lang="pug">
mixin thumb(item)
  .thumb
    lazyload.img(:src='item.thumb.fileUrl')
    .title
      | {{ item.title }}
      i.i-fa6-solid-up-right-from-square(v-if='item.isWeb', style='float: right')

#categories-container
  h1 Categories Index

  .loading.align-center(v-if='loading')
    placeholder

  PicaMbox(v-if='error', type='error', header='Failed to get categories data')
    p {{ error }}

  ul.categories-list
    li(v-for='item in list')
      .pica-card.category-card(v-if='item.active !== false')
        e-link.no-icon(v-if='item.isWeb', :href='item.link')
          +thumb(item)
        NuxtLink(v-else, :to='"/comics/" + item.title')
          +thumb(item)
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getErrMsg } from '~/utils/getErrMsg'
import { setTitle } from '~/utils/setTitle'
import type { PicaCategory } from '~/types'
import { useCategoryStore } from '~/stores/category'

const catStore = useCategoryStore()
const list = ref<PicaCategory[]>([])
const error = ref('')
const loading = ref(false)

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

<style lang="scss">
.categories-list {
  list-style: none;
  padding-left: 0;
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;

  li {
    max-width: 240px;
    width: calc(50% - 1rem);
  }

  // pica-card override: remove padding, keep border+shadow, add hover press effect
  .category-card {
    position: relative;
    line-height: 0;
    padding: 0;
    overflow: hidden;

    // Neubrutalism press effect on hover
    &:hover {
      translate: 3px 3px;
      box-shadow: 0 0 0 0 #000;
    }

    > a {
      display: block;
      width: 100%;
    }

    .thumb {
      position: relative;
      overflow: hidden;
      width: 100%;
      height: 0;
      padding-top: 100%;

      .lazyload {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        width: 100%;
        height: 100%;
        transition: transform 0.24s ease;
        transform: scale(1);
      }

      &:hover .lazyload {
        transform: scale(1.1);
      }

      // Title overlay: Neubrutalism style — cream bg, bold black text
      .title {
        position: absolute;
        font-weight: 900;
        font-size: 1rem;
        color: #000;
        background-color: #FFF8DC;
        border-top: 3px solid #000;
        left: 0;
        bottom: 0;
        padding: 0.4rem 0.75rem;
        width: 100%;
        line-height: 1.2;
        box-sizing: border-box;
      }
    }
  }
}
</style>
