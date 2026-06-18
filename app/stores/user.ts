import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { picaClient } from '~/utils/pica-client'
import type { PicaListSortType, PicaUserProfile } from '~/types'

enum StorageKey {
  TOKEN = 'pica:user/token',
  PROFILE = 'pica:user/profile',
}

export const useUserStore = defineStore('user', () => {
  const profile = ref<PicaUserProfile | null>(null)
  const isLoggedIn = computed(() => !!profile.value)

  // Hydrate from localStorage on init for instant UI
  if (localStorage.getItem(StorageKey.TOKEN) && localStorage.getItem(StorageKey.PROFILE)) {
    try {
      profile.value = JSON.parse(localStorage.getItem(StorageKey.PROFILE)!)
    } catch {
      localStorage.removeItem(StorageKey.PROFILE)
    }
  }

  async function login(email: string, password: string) {
    const token = await picaClient.signIn(email, password)
    localStorage.setItem(StorageKey.TOKEN, token)
    return fetchProfile()
  }

  async function logout() {
    profile.value = null
    localStorage.removeItem(StorageKey.PROFILE)
    localStorage.removeItem(StorageKey.TOKEN)
  }

  let _fetchProfilePromise: Promise<PicaUserProfile> | null = null
  async function fetchProfile(): Promise<PicaUserProfile> {
    if (!localStorage.getItem(StorageKey.TOKEN)) {
      throw new Error('Not logged in')
    }

    if (!_fetchProfilePromise) {
      _fetchProfilePromise = picaClient
        .fetchProfile()
        .then((user) => {
          _fetchProfilePromise = null
          if (!user) {
            logout()
            throw new Error('Failed to get user profile, please log in again')
          }
          profile.value = user
          localStorage.setItem(StorageKey.PROFILE, JSON.stringify(user))
          return user
        })
        .catch((err) => {
          _fetchProfilePromise = null
          logout()
          return Promise.reject(err) as any
        })
    }

    return _fetchProfilePromise
  }

  async function register(payload: Parameters<typeof picaClient.register>[0]) {
    return picaClient.register(payload)
  }

  async function fetchFavoriteBooks(payload: {
    sort: PicaListSortType
    page: number
  }) {
    return picaClient.fetchFavoriteBooks(payload.page, payload.sort)
  }

  return {
    profile,
    isLoggedIn,
    login,
    logout,
    register,
    fetchProfile,
    fetchFavoriteBooks,
  }
})
