import { create as createAxios } from 'axios'
import Constants from 'expo-constants'
import { Platform } from 'react-native'

import { resolveApiUrl } from './apiUrl'
import { tokenStorage } from './tokenStorage'

export const apiUrl = resolveApiUrl({
  isWeb: Platform.OS === 'web',
  apiPort: process.env.EXPO_PUBLIC_API_PORT,
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
  location: Platform.OS === 'web' ? window.location : undefined,
  devServerHost: Constants.expoConfig?.hostUri,
})

export type ApiResponse<T> = { success: boolean; message?: string; data: T }

export const api = createAxios({
  baseURL: apiUrl,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: Platform.OS === 'web',
})

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.get()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const unwrap = <T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> =>
  promise.then((response) => response.data.data)
