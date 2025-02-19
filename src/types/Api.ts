import { FileMedia, type FileThumb } from './File.js'

export type ApiResponse<T = unknown> = {
  code: number
  message: string
  body: T
  debug?: any
}

export interface PicaCategory {
  title: string
  thumb: FileMedia
  isWeb: boolean
  active: boolean
  link: string
}
export type ApiResponseCategories = ApiResponse<{
  categories: PicaCategory[]
}>

export interface PicaBookListItem {
  _id: string
  title: string
  author: string
  totalViews: number
  totalLikes: number
  pagesCount: number
  epsCount: number
  finished: boolean
  categories: string[]
  thumb: FileMedia
  id: string
  likesCount: number
}
export type ApiResponseBookList = ApiResponse<{
  comics: {
    docs: PicaBookListItem[]
    total: number
    limit: number
    page: number
    pages: number
  }
}>

export interface PicaUserProfile {
  _id: string
  birthday: string
  email: string
  gender: 'm' | 'f' | 'bot'
  name: string
  slogan: string
  title: string
  verified: boolean
  exp: number
  level: number
  characters: any[]
  created_at: string
  avatar: FileMedia
  isPunched: boolean
}
export type ApiResponseUserProfile = ApiResponse<{ user: PicaUserProfile }>

export interface PicaBookMeta {
  _id: string
  _creator: PicaUserProfile
  title: string
  description: string
  thumb: FileMedia
  author: string
  chineseTeam: string
  categories: string[]
  tags: string[]
  pagesCount: number
  epsCount: number
  finished: boolean
  updated_at: string
  created_at: string
  allowDownload: boolean
  viewsCount: number
  likesCount: number
  isFavourite: boolean
  isLiked: boolean
  commentsCount: number
}
export type ApiResponseBookMeta = ApiResponse<{
  comic: PicaBookMeta
}>

export interface PicaBookEp {
  _id: string
  id: string
  order: number
  title: string
  updated_at: string
}
export type ApiResponseBookEps = ApiResponse<{
  eps: {
    docs: PicaBookEp[]
    total: number
    limit: number
    page: number
    pages: number
  }
}>

export interface PicaBookPage {
  _id: string
  id: string
  media: FileMedia
}
export type ApiResponseBookPages = ApiResponse<{
  ep: {
    _id: string
    title: string
  }
  pages: {
    docs: PicaBookPage[]
    limit: number
    page: number
    pages: number
    total: number
  }
}>

/**
 * 排序方式
 * ```
 * ua = user asing = 默认排序(用户指定)
 * dd = date desc = 新到旧
 * da = date asc = 旧到新
 * ld = like desc = 最多爱心(收藏)
 * vd = view desc = 最多指名(浏览)
 * ```
 */
export type PicaListSortType = 'ua' | 'dd' | 'da' | 'ld' | 'vd'
export enum PicaListSort {
  DEFAULT = 'ua',
  DATE_DESC = 'dd',
  DATE_ASC = 'da',
  LIKE_DESC = 'ld',
  VIEW_DESC = 'vd',
}
export const PICA_LIST_SORT_OPTIONS = [
  { label: '默认排序', value: PicaListSort.DEFAULT },
  { label: '新到旧', value: PicaListSort.DATE_DESC },
  { label: '旧到新', value: PicaListSort.DATE_ASC },
  { label: '最多收藏', value: PicaListSort.LIKE_DESC },
  { label: '最多浏览', value: PicaListSort.VIEW_DESC },
]
