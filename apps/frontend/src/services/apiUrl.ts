export const DEFAULT_API_PORT = '5000'

type ApiUrlOptions = {
  isWeb: boolean
  apiPort?: string
  apiUrl?: string
  location?: Pick<Location, 'protocol' | 'hostname'>
  devServerHost?: string | null
}

// Web: the API runs on the same host as the web app, so only its port is configured.
// Native (Expo Go): there is no page address, so use EXPO_PUBLIC_API_URL, or else the computer that serves the development bundle.
export const resolveApiUrl = ({ isWeb, apiPort, apiUrl, location, devServerHost }: ApiUrlOptions): string => {
  const port = apiPort || DEFAULT_API_PORT

  if (isWeb && location) {
    return `${location.protocol}//${location.hostname}:${port}`
  }

  if (apiUrl) {
    return apiUrl.replace(/\/+$/, '')
  }

  const host = devServerHost?.split(':')[0] || 'localhost'

  return `http://${host}:${port}`
}
