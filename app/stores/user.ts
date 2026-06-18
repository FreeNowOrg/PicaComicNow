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
    if (
      localStorage.getItem(StorageKey.TOKEN) &&
      localStorage.getItem(StorageKey.PROFILE)
    ) {
      try {
        profile.value = JSON.parse(localStorage.getItem(StorageKey.PROFILE)!)
        return profile.value!
      } catch (e) {
        console.error('Failed to parse user info from localStorage', e)
      }
    }

    if (!_fetchProfilePromise) {
      _fetchProfilePromise = picaClient
        .fetchProfile()
        .catch((err) => {
          _fetchProfilePromise = null
          logout()
          return Promise.reject(err) as any
        })
    }

    const user = await _fetchProfilePromise
    if (!user) {
      _fetchProfilePromise = null
      logout()
      throw new Error('Failed to get user profile, please log in again')
    }
    profile.value = user
    localStorage.setItem(StorageKey.PROFILE, JSON.stringify(user))
    return user
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
    fetchProfile,
    fetchFavoriteBooks,
  }
})
