<template lang="pug">
#categories-container
  .bread-crumb
    NuxtLink(to='/') 首页
    span 分类列表

  h1 分类列表

  .loading.align-center(v-if='loading')
    Placeholder

  PicaMbox(v-if='error', type='error', header='加载分类失败')
    p {{ error }}

  .categories-grid(v-if='list.length')
    template(v-for='item in list')
      NuxtLink.category-item(
        v-if='item.active !== false && !item.isWeb',
        :to='"/comics/" + item.title'
      )
        .category-thumb
          Lazyload(:src='item.thumb.fileUrl')
        .category-name {{ item.title }}
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
  setTitle('分类列表')
  init()
})
</script>

<style scoped lang="scss">
.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.75rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: 2px solid #000;
  background: #fff;
  box-shadow: 3px 3px 0 0 #000;
  text-decoration: none;
  color: #000;
  font-weight: 700;
  font-size: 0.9rem;
  transition: all 0.15s;

  &:hover {
    translate: 2px 2px;
    box-shadow: 0 0 0 0 #000;
    background: #FFE066;
    text-decoration: none;
  }
}

.category-thumb {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: 2px solid #000;
  overflow: hidden;

  :deep(.lazyload) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.category-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
