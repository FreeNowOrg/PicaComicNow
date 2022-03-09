import { FileThumb } from './File'

export type ApiResponse<T = unknown> = {
  code: number
  message: string
  body: T
  debug?: any
}

export interface Category {
  title: string
  thumb: FileThumb
  isWeb: boolean
  active: boolean
  link: string
}
export type ApiResponseCategories = ApiResponse<Category[]>

export interface Comic {
  _id: string
  title: string
  author: string
  totalViews: number
  totalLikes: number
  pagesCount: number
  epsCount: number
  finished: boolean
  categories: string[]
  thumb: {
    fileServer: string
    path: string
    originalName: string
    fileUrl: string
  }
  id: string
  likesCount: number
}

export type ApiResponseComics = ApiResponse<{
  comics: {
    docs: Comic[]
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
  avatar: FileThumb
  isPunched: boolean
}

export type ApiResponseUserProfile = ApiResponse<{ user: UserProfile }>

export interface ComicInfo {
  _id: string
  _creator: UserProfile
  title: string
  description: string
  thumb: FileThumb
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
