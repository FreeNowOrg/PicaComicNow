import { defineStore } from 'pinia'
import axios from 'axios'
import type {
  ApiResponseBookEps,
  ApiResponseBookMeta,
  ApiResponseBookPages,
  PicaBookMeta,
  PicaBookPage,
  PicaBookEp,
} from '@/types'
import { API_BASE } from '@/config'
import { PicaCache } from '@/utils/PicaCache'

export interface BookPagesStoreState {
  docs: PicaBookPage[]
  totalDocs: number
  pagination: number
  totalPagination: number
}

export const useBookStore = defineStore('book', () => {
  const noCacheMode =
    window?.location &&
    (location.search.includes('noCache') || location.hash.includes('noCache'))

  const bookMetaCache = new PicaCache<PicaBookMeta>('book/meta')
  async function fetchBookMeta(bookid: string) {
    return axios
      .get<ApiResponseBookMeta>(`${API_BASE}/comics/${bookid}`)
      .then(({ data }) => {
        return data.body.comic
      })
  }
  async function getBookMeta(bookid: string, noCache: boolean = noCacheMode) {
    if (!noCache) {
      const cached = await bookMetaCache.get(bookid)
      if (cached) {
        return cached
      }
    }
    const data = await fetchBookMeta(bookid)
    await bookMetaCache.set(bookid, data)
    return data
  }

  const bookEpsCache = new PicaCache<PicaBookEp[]>('book/eps')
  async function fetchBookEps(bookid: string) {
    const list: PicaBookEp[] = []
    const fetchOnePage = async (page: number): Promise<void> => {
      return axios
        .get<ApiResponseBookEps>(`${API_BASE}/comics/${bookid}/eps`, {
          params: {
            page,
            limit: 100,
          },
        })
        .then(({ data }) => {
          const { eps } = data.body
          list.push(...eps.docs)
          if (eps.page < eps.pages) {
            return fetchOnePage(eps.page + 1)
          }
        })
    }
    await fetchOnePage(1)
    return list
  }
  async function getBookEps(bookid: string, noCache: boolean = noCacheMode) {
    if (!noCache) {
      const cached = await bookEpsCache.get(bookid)
      if (cached) {
        return cached
      }
    }
    const data = await fetchBookEps(bookid)
    await bookEpsCache.set(bookid, data)
    return data
  }

  async function toggleBookmark(bookid: string) {
    return axios
      .post(`${API_BASE}/comics/${bookid}/favourite`)
      .then(({ data }: any) => {
        if (data.body.action === 'favourite') {
          return true
        } else if (data.body.action === 'un_favourite') {
          return false
        } else {
          throw new Error('Invalid action')
        }
      })
  }

  const bookPagesCache = new PicaCache<BookPagesStoreState>('book/pages')
  async function fetchBookPages(
    bookid: string,
    epsid: string,
    pagination: number
  ) {
    pagination = Math.max(1, pagination)
    return axios
      .get<ApiResponseBookPages>(
        `${API_BASE}/comics/${bookid}/order/${epsid}/pages`,
        {
          params: {
            page: pagination,
            limit: 30,
          },
        }
      )
      .then(({ data }) => {
        return {
          docs: data.body.pages.docs,
          totalDocs: data.body.pages.total,
          pagination: pagination,
          totalPagination: data.body.pages.pages,
        } as BookPagesStoreState
      })
  }
  async function getBookPages(
    bookid: string,
    epsid: string,
    pagination: number,
    noCache: boolean = noCacheMode
  ) {
    const cacheKey = `${bookid}/${epsid}/${pagination}`
    if (!noCache) {
      const cached = await bookPagesCache.get(cacheKey)
      if (cached) {
        return cached
      }
    }
    const data = await fetchBookPages(bookid, epsid, pagination)
    await bookPagesCache.set(cacheKey, data)
    return data
  }

  // CLEANUP LEGACY CACHES
  if (window?.localStorage.length) {
    const keys = Object.keys(window.localStorage).filter((key) =>
      key.startsWith('pica:book')
    )
    keys.forEach((key) => {
      window.localStorage.removeItem(key)
    })
  }

  return {
    getBookMeta,
    getBookEps,
    getBookPages,
    toggleBookmark,
  }
})
