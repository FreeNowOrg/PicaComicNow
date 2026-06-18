import { ref } from 'vue'
import { defineStore } from 'pinia'
import { picaClient } from '~/utils/pica-client'
import { LRUMap } from '~/utils/LRUMap'
import type {
  ApiResponseBookList,
  PicaCategory,
  PicaListSort,
  PicaListSortType,
} from '~/types'

export const useCategoryStore = defineStore('category', () => {
  const categoriesIndex = ref<PicaCategory[]>([])

  async function fetchCategoriesIndex() {
    if (categoriesIndex.value.length) {
      return categoriesIndex.value
    }
    const categories = await picaClient.fetchCategories()
    categoriesIndex.value = categories
    return categories
  }

  const booksInCategoryMemoryCache = new LRUMap<
    string,
    ApiResponseBookList['body']
  >()

  async function fetchBooksInCategory(
    category: string,
    pagination: number,
    sort: PicaListSortType = 'dd'
  ) {
    const validSorts: PicaListSortType[] = ['ua', 'dd', 'da', 'ld', 'vd']
    if (!validSorts.includes(sort)) {
      sort = 'ua'
    }
    const key = `${category}-${sort}-${pagination}`
    if (booksInCategoryMemoryCache.has(key)) {
      return booksInCategoryMemoryCache.get(key)!.comics
    }
    const body = await picaClient.fetchBooksInCategory(category, pagination, sort)
    booksInCategoryMemoryCache.set(key, body)
    return body.comics
  }

  return {
    categoriesIndex,
    fetchCategoriesIndex,
    fetchBooksInCategory,
  }
})
