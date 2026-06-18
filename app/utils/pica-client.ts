import axios, { type AxiosInstance } from 'axios'
import nprogress from 'nprogress'
import type {
  ApiResponseBookEps,
  ApiResponseBookList,
  ApiResponseBookMeta,
  ApiResponseBookPages,
  ApiResponseCategories,
  ApiResponseUserProfile,
  PicaListSortType,
} from '~/types'

const TOKEN_KEY = 'pica:user/token'

class PicaComicClient {
  readonly http: AxiosInstance

  constructor() {
    this.http = axios.create({ baseURL: '/api' })

    this.http.interceptors.request.use((config) => {
      nprogress.start()
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        config.headers['authorization'] = token
      }
      return config
    })

    this.http.interceptors.response.use(
      (response) => {
        nprogress.done()
        return response
      },
      (error) => {
        nprogress.done()
        if (error.response?.status === 401) {
          console.warn('Axios Error: 401 unauthorized. Clear user data!')
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem('pica:user/profile')
          const currentPath = window.location.pathname
          if (currentPath !== '/auth') {
            navigateTo({
              path: '/auth',
              query: { from: currentPath, tips: '1' },
            })
          }
        }
        return Promise.reject(error)
      }
    )
  }

  async signIn(email: string, password: string) {
    const { data } = await this.http.post('/auth/sign-in', { email, password }, {
      headers: { 'cache-control': 'no-cache' },
    })
    return data.body.token as string
  }

  async fetchProfile() {
    const { data } = await this.http.get<ApiResponseUserProfile>('/users/profile')
    return data.body.user
  }

  async fetchFavoriteBooks(page: number, sort: PicaListSortType) {
    const { data } = await this.http.get<ApiResponseBookList>('/users/favourite', {
      params: { s: sort, page },
    })
    return data.body
  }

  async fetchCategories() {
    const { data } = await this.http.get<ApiResponseCategories>('/categories')
    return data.body.categories
  }

  async fetchBookMeta(bookid: string) {
    const { data } = await this.http.get<ApiResponseBookMeta>(`/comics/${bookid}`)
    return data.body.comic
  }

  async fetchBookEps(bookid: string, page: number) {
    const { data } = await this.http.get<ApiResponseBookEps>(`/comics/${bookid}/eps`, {
      params: { page, limit: 100 },
    })
    return data.body.eps
  }

  async fetchBookPages(bookid: string, epsid: string, page: number) {
    const { data } = await this.http.get<ApiResponseBookPages>(
      `/comics/${bookid}/order/${epsid}/pages`,
      { params: { page, limit: 30 } }
    )
    return data.body
  }

  async toggleBookmark(bookid: string) {
    const { data } = await this.http.post(`/comics/${bookid}/favourite`)
    if (data.body.action === 'favourite') return true
    if (data.body.action === 'un_favourite') return false
    throw new Error('Invalid action')
  }

  async searchComics(keyword: string, params?: {
    category?: string
    page?: number
    sort?: PicaListSortType
  }) {
    const { data } = await this.http.post<ApiResponseBookList>(
      '/comics/advanced-search',
      {
        keyword,
        categories: params?.category ? [params.category] : undefined,
        sort: params?.sort,
      },
      { params: { page: params?.page } }
    )
    return data.body
  }

  async updateSlogan(slogan: string) {
    const { data } = await this.http.put('/users/profile', { slogan })
    return data
  }

  async changePassword(oldPassword: string, newPassword: string) {
    const { data } = await this.http.put('/users/password', {
      old_password: oldPassword,
      new_password: newPassword,
    })
    return data
  }

  async fetchBooksInCategory(category: string, page: number, sort: PicaListSortType) {
    const { data } = await this.http.get<ApiResponseBookList>('/comics', {
      params: { c: category, page, s: sort },
    })
    return data.body
  }
}

export const picaClient = new PicaComicClient()
