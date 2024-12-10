import { defineStore } from 'pinia'
import localforage from 'localforage'
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
import { LRUMap } from '@/utils/LRUMap'

const CACHE_TIMEOUT = 1000 * 60 * 60 * 24 // 24 hours
const DB_NAME = 'PicaComicNow'
const createDatabase = (storeName: string) => {
  return localforage.createInstance({
    name: DB_NAME,
    storeName,
  })
}
const loadFromDbWithExpiry = async <T>(
  db: LocalForage,
  key: string,
  maxAge: number = CACHE_TIMEOUT
) => {
  const data = await db.getItem<{ time: number; value: T }>(key)
  if (!data) {
    return null
  }
  if (Date.now() - data.time > maxAge) {
    return null
  }
  return data.value
}
const checkRequestNoCache = () =>
  new URL(window.location.href).searchParams.has('noCache')

export interface BookPagesStoreState {
  docs: PicaBookPage[]
  totalDocs: number
  pagination: number
  totalPagination: number
}

export const useBookStore = defineStore('book', () => {
  const bookMetaDB = createDatabase('book/meta')
  const bookMetaLRU = new LRUMap<string, PicaBookMeta>()
  async function fetchBookMeta(bookid: string) {
    return axios
      .get<ApiResponseBookMeta>(`${API_BASE}/comics/${bookid}`)
      .then(({ data }) => {
        return data.body.comic
      })
  }
  async function getBookMetaFromCache(bookid: string) {
    const cached = bookMetaLRU.get(bookid)
    if (cached) {
      return cached
    }
    const data = await loadFromDbWithExpiry<PicaBookMeta>(bookMetaDB, bookid)
    if (!data) {
      return null
    }
    bookMetaLRU.set(bookid, data)
    return data
  }
  async function setBookMetaToCache(bookid: string, value: PicaBookMeta) {
    bookMetaLRU.set(bookid, value)
    return bookMetaDB.setItem(bookid, {
      time: Date.now(),
      value,
    })
  }
  async function getBookMeta(
    bookid: string,
    noCache: boolean = checkRequestNoCache()
  ) {
    if (!noCache) {
      const cached = await getBookMetaFromCache(bookid)
      if (cached) {
        return cached
      }
    }
    const data = await fetchBookMeta(bookid)
    await setBookMetaToCache(bookid, data)
    return data
  }

  const bookEpsDB = createDatabase('book/eps')
  const bookEpsLRU = new LRUMap<string, PicaBookEp[]>()
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
  async function getBookEpsFromCache(bookid: string) {
    const cached = bookEpsLRU.get(bookid)
    if (cached) {
      return cached
    }
    const data = await loadFromDbWithExpiry<PicaBookEp[]>(bookEpsDB, bookid)
    if (!data) {
      return null
    }
    bookEpsLRU.set(bookid, data)
    return data
  }
  async function setBookEpsToCache(bookid: string, value: PicaBookEp[]) {
    if (value.length === 0) {
      return
    }
    bookEpsLRU.set(bookid, value)
    return bookEpsDB.setItem(bookid, {
      time: Date.now(),
      value,
    })
  }
  async function getBookEps(
    bookid: string,
    noCache: boolean = checkRequestNoCache()
  ) {
    if (!noCache) {
      const cached = await getBookEpsFromCache(bookid)
      if (cached) {
        return cached
      }
    }
    const data = await fetchBookEps(bookid)
    await setBookEpsToCache(bookid, data)
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

  const bookPagesDB = createDatabase('book/pages')
  const bookPagesLRU = new LRUMap<string, BookPagesStoreState>()
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
  async function getBookPagesFromCache(
    bookid: string,
    epsid: string,
    pagination: number
  ) {
    const key = `${bookid}/${epsid}/${pagination}`
    const cached = bookPagesLRU.get(key)
    if (cached) {
      return cached
    }
    const data = await loadFromDbWithExpiry<BookPagesStoreState>(
      bookPagesDB,
      key
    )
    if (!data) {
      return null
    }
    bookPagesLRU.set(key, data)
    return data
  }
  async function setBookPagesToCache(
    bookid: string,
    epsid: string,
    pagination: number,
    value: BookPagesStoreState
  ) {
    const key = `${bookid}/${epsid}/${pagination}`
    bookPagesLRU.set(key, value)
    return bookPagesDB.setItem(key, {
      time: Date.now(),
      value,
    })
  }
  async function getBookPages(
    bookid: string,
    epsid: string,
    pagination: number,
    noCache: boolean = checkRequestNoCache()
  ) {
    if (!noCache) {
      const cached = await getBookPagesFromCache(bookid, epsid, pagination)
      if (cached) {
        return cached
      }
    }
    const data = await fetchBookPages(bookid, epsid, pagination)
    await setBookPagesToCache(bookid, epsid, pagination, data)
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
