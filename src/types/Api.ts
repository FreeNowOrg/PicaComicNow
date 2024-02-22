import { FileMedia, type FileThumb } from './File.js'

export type ApiResponse<T = unknown> = {
  code: number
  message: string
  body: T
  debug?: any
}

export interface Category {
  title: string
  thumb: FileMedia
  isWeb: boolean
  active: boolean
  link: string
}
export type ApiResponseCategories = ApiResponse<{
  categories: Category[]
}>

export interface ComicListItem {
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
export type ApiResponseComics = ApiResponse<{
  comics: {
    docs: ComicListItem[]
    total: number
    limit: 20
    page: number
    pages: number
  }
}>

export interface UserProfile {
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
export type ApiResponseUserProfile = ApiResponse<{ user: UserProfile }>

export interface ComicDetails {
  _id: string
  _creator: UserProfile
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
export type ApiResponseComicInfo = ApiResponse<{
  comic: ComicDetails
}>

export interface EpsItem {
  _id: string
  id: string
  order: number
  title: string
  updated_at: string
}
export type ApiResponseComicEps = ApiResponse<{
  eps: {
    docs: EpsItem[]
    total: number
    limit: number
    page: number
    pages: number
  }
}>

export interface ComicPagesItem {
  _id: string
  id: string
  media: FileMedia
}
export type ApiResponseComicPages = ApiResponse<{
  ep: {
    _id: string
    title: string
  }
  docs: ComicPagesItem[]
  limit: number
  page: number
  pages: number
  total: number
}>
