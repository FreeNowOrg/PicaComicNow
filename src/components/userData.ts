import axios from 'axios'
import { ref } from 'vue'
import { API_BASE } from '../config'
import { type UserProfile } from '../types'

export const userData = ref<UserProfile | null>(null)

export async function getToken(
  email: string,
  password: string
): Promise<string> {
  console.log('Log in with credentials', {
    email,
    password,
  })

  const { data }: any = await axios.post(
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

  return data?.body?.token || ''
}

export async function getProfile(): Promise<UserProfile> {
  console.info('Get profile')
  const { data }: any = await axios.get(`${API_BASE}/users/profile`)
  const p = data?.body?.user || null
  userData.value = p
  return p
}
