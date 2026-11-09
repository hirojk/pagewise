// Web version: the session lives in the httpOnly `sessionToken` cookie that the API sets at login.
// Page scripts can't read that cookie, so an XSS bug can't steal the session. Nothing is kept here, and the API client sends the cookie itself (`withCredentials` in api.ts).
// Native apps use tokenStorage.native.ts (Keychain / Keystore) and send a Bearer header instead.

// Older versions kept the token in localStorage; remove it so it doesn't linger.
const LEGACY_TOKEN_KEY = 'sessionToken'
try {
  globalThis.localStorage?.removeItem(LEGACY_TOKEN_KEY)
} catch {
}

export const tokenStorage = {
  async get(): Promise<string | null> {
    return null
  },
  async set(_token: string): Promise<void> {},
  async remove(): Promise<void> {},
}
