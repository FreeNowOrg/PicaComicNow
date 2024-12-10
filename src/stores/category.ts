import { API_BASE } from '@/config'
import {
  ApiResponseBookList,
  ApiResponseCategories,
  PicaCategory,
  PicaListSort,
} from '@/types'
import { LRUMap } from '@/utils/LRUMap'
import axios from 'axios'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCategoryStore = defineStore('category', () => {
  const categoriesIndex = ref<PicaCategory[]>([])
  async function fetchCategoriesIndex() {
    if (categoriesIndex.value.length) {
      return categoriesIndex.value
    }
    const { data } = await axios.get<ApiResponseCategories>(
      `${API_BASE}/categories`
    )
    categoriesIndex.value = data.body.categories
    return data.body.categories
  }

  const booksInCategoryMemoryCache = new LRUMap<
    string,
    ApiResponseBookList['body']
  >()
  async function fetchBooksInCategory(
    category: string,
    pagination: number,
    sort = PicaListSort.DATE_DESC
  ): Promise<ApiResponseBookList['body']['comics']> {
    if (!(sort in PicaListSort)) {
      sort = PicaListSort.DEFAULT
    }
    const key = `${category}-${sort}-${pagination}`
    if (booksInCategoryMemoryCache.has(key)) {
      return booksInCategoryMemoryCache.get(key)!.comics
    }
    const { data } = await axios.get<ApiResponseBookList>(
      `${API_BASE}/comics`,
      {
        params: {
          c: category,
          page: pagination,
          s: sort,
        },
      }
    )
    booksInCategoryMemoryCache.set(key, data.body)
    return data.body.comics
  }

  return {
    categoriesIndex,
    fetchCategoriesIndex,
    fetchBooksInCategory,
  }
})
