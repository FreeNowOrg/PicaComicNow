import type { PicaBookMeta, PicaBookPage, PicaBookEp } from '@/types'
import { FishStore } from 'fish-store'

const DEFAULT_CACHE_TIME = 2 * 60 * 60 * 1000 // 2 hours
const checkIsNoCache = () => {
  return new URLSearchParams(location.search).has('noCache')
}
const getDefaultMaxAge = () => {
  return checkIsNoCache() ? 0 : DEFAULT_CACHE_TIME
}

export const useBookMetaStore = (bookId: string, maxAge = getDefaultMaxAge()) =>
  new FishStore<PicaBookMeta>(`pica:book/${bookId}/info`, maxAge)

export const useBookEpsStore = (bookId: string, maxAge = getDefaultMaxAge()) =>
  new FishStore<PicaBookEp[]>(`pica:book/${bookId}/eps`, maxAge)

export const useBookPagesStore = (
  bookId: string,
  epsid: string,
  maxAge = getDefaultMaxAge()
) =>
  new FishStore<{
    docs: PicaBookPage[]
    ep: {
      _id: string
      title: string
    }
    total: number
    loadedPagination: number
    totalPagination: number
  }>(`pica:book/${bookId}/pages/${epsid}`, maxAge)
