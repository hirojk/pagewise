import { isAxiosError } from 'axios'
import { create } from 'zustand'
import type { UserType } from '@pagewise/shared'

import { api, unwrap } from '@services/api'
import { tokenStorage } from '@services/tokenStorage'

type AuthState = {
  user: UserType | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  fetchUser: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  async login(username, password) {
    const { sessionToken } = await unwrap<{ sessionToken: string }>(api.post('/api/auth/login', { username, password }))

    await tokenStorage.set(sessionToken)
    await get().fetchUser()
  },

  async fetchUser() {
    try {
      const user = await unwrap<UserType>(api.get('/api/v1/users/me'))
      set({ user })
    } catch (error) {
      if (!isAxiosError(error) || error.response?.status !== 401) {
        console.error('fetch user session error:', error)
      }
      set({ user: null })
    } finally {
      set({ isLoading: false })
    }
  },

  async logout() {
    try {
      await api.post('/api/auth/logout')
    } finally {
      await tokenStorage.remove()
      set({ user: null })
    }
  },
}))
