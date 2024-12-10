import axios from 'axios'
import { computed, ref } from 'vue'
import { API_BASE } from '../config'
import {
  ApiResponseBookList,
  PicaListSortType,
  type PicaUserProfile,
} from '../types'
import { defineStore } from 'pinia'
import { router } from '@/router'

export const useUserStore = defineStore('user', () => {
  const data = ref<PicaUserProfile | null>(null)
  const isLoggedIn = computed(() => !!data.value)

  // Inject inspectors
  axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('PICA_USER_TOKEN')
    if (token) {
      config.headers['authorization'] = token
    }
    return config
  })
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn('Axios Error: 401 unauthorized. Clear user data!')
        logout()
        if (router.currentRoute.value.name !== 'auth') {
          router.push({
            name: 'auth',
            query: {
              from: router.currentRoute.value.fullPath,
              tips: '1',
            },
          })
        }
      }
      return Promise.reject(error)
    }
  )

  async function login(email: string, password: string) {
    console.log('Log in with credentials', {
      email,
      password,
    })

    const { data: d }: any = await axios.post(
      `${API_BASE}/auth/sign-in`,
      {
        email,
        password,
      },
      {
        headers: {
          'cache-control': 'no-cache',
        },
      }
    )

    if (d?.body?.token) {
      localStorage.setItem('PICA_USER_TOKEN', d.body.token)
      return fetchProfile()
    } else {
      throw new Error('Failed to log in, please check your credentials')
    }
  }

  /**
   * A.K.A. clear user data
   */
  async function logout() {
    data.value = null
    localStorage.removeItem('PICA_USER_INFO')
    localStorage.removeItem('PICA_USER_TOKEN')
  }

  let _fetchProfilePromise: Promise<PicaUserProfile> | null = null
  async function fetchProfile(): Promise<PicaUserProfile> {
    if (!localStorage.getItem('PICA_USER_TOKEN')) {
      throw new Error('Not logged in')
    }
    if (
      localStorage.getItem('PICA_USER_TOKEN') &&
      localStorage.getItem('PICA_USER_INFO')
    ) {
      try {
        data.value = JSON.parse(localStorage.getItem('PICA_USER_INFO')!)
        return data.value!
      } catch (e) {
        console.error('Failed to parse user info from localStorage', e)
      }
    }

    if (!_fetchProfilePromise) {
      _fetchProfilePromise = axios
        .get(`${API_BASE}/users/profile`, {
          headers: {
            authorization: localStorage.getItem('PICA_USER_TOKEN') || undefined,
          },
        })
        .catch((err) => {
          _fetchProfilePromise = null
          logout()
          return Promise.reject(err) as any
        })
    }

    const { data: d }: any = await _fetchProfilePromise
    const user = d?.body?.user || null
    if (!user) {
      _fetchProfilePromise = null
      logout()
      throw new Error('Failed to get user profile, please log in again')
    }
    console.info('Fetched user profile', user)
    data.value = user
    localStorage.setItem('PICA_USER_INFO', JSON.stringify(user))
    return user
  }

  async function fetchFavoriteBooks(payload: {
    sort: PicaListSortType
    page: number
  }) {
    return axios
      .get<ApiResponseBookList>(`${API_BASE}/users/favourite`, {
        params: {
          s: payload.sort,
          page: payload.page,
        },
      })
      .then((res) => res.data.body)
  }

  return {
    data,
    isLoggedIn,
    login,
    logout,
    fetchProfile,
    fetchFavoriteBooks,
  }
})
