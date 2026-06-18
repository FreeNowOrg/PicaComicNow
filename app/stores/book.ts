import { defineStore } from 'pinia'
import { picaClient } from '~/utils/pica-client'
import { PicaCache } from '~/utils/PicaCache'
import type { PicaBookMeta, PicaBookEp, PicaBookPage } from '~/types'

export interface BookPagesStoreState {
  docs: PicaBookPage[]
  totalDocs: number
  pagination: number
  totalPagination: number
}

export const useBookStore = defineStore('book', () => {
  const noCacheMode =
    typeof window !== 'undefined' &&
    (location.search.includes('noCache') || location.hash.includes('noCache'))

  const bookMetaCache = new PicaCache<PicaBookMeta>('book/meta')
  async function getBookMeta(bookid: string, noCache: boolean = noCacheMode) {
    if (!noCache) {
      const cached = await bookMetaCache.get(bookid)
      if (cached) return cached
    }
    const data = await picaClient.fetchBookMeta(bookid)
    await bookMetaCache.set(bookid, data)
    return data
  }

  const bookEpsCache = new PicaCache<PicaBookEp[]>('book/eps')
  async function getBookEps(bookid: string, noCache: boolean = noCacheMode) {
    if (!noCache) {
      const cached = await bookEpsCache.get(bookid)
      if (cached) return cached
    }
    const list: PicaBookEp[] = []
    const fetchOnePage = async (page: number): Promise<void> => {
      const eps = await picaClient.fetchBookEps(bookid, page)
      list.push(...eps.docs)
      if (eps.page < eps.pages) {
        return fetchOnePage(eps.page + 1)
      }
    }
    await fetchOnePage(1)
    await bookEpsCache.set(bookid, list)
    return list
  }

  async function toggleBookmark(bookid: string) {
    return picaClient.toggleBookmark(bookid)
  }

  const bookPagesCache = new PicaCache<BookPagesStoreState>('book/pages')
  async function getBookPages(
    bookid: string,
    epsid: string,
    pagination: number,
    noCache: boolean = noCacheMode
  ) {
    pagination = Math.max(1, pagination)
    const cacheKey = `${bookid}/${epsid}/${pagination}`
    if (!noCache) {
      const cached = await bookPagesCache.get(cacheKey)
      if (cached) return cached
    }
    const result = await picaClient.fetchBookPages(bookid, epsid, pagination)
    const state: BookPagesStoreState = {
      docs: result.pages.docs,
      totalDocs: result.pages.total,
      pagination,
      totalPagination: result.pages.pages,
    }
    await bookPagesCache.set(cacheKey, state)
    return state
  }

  // Cleanup legacy localStorage caches
  if (typeof window !== 'undefined' && window.localStorage.length) {
    const keys = Object.keys(window.localStorage).filter((key) =>
      key.startsWith('pica:book')
    )
    keys.forEach((key) => window.localStorage.removeItem(key))
  }

  return {
    getBookMeta,
    getBookEps,
    getBookPages,
    toggleBookmark,
  }
})
