import { describe, expect, it } from 'vitest'

import { resolveApiUrl } from '@services/apiUrl'

describe('resolveApiUrl', () => {
  it('uses the host the web app was opened from', () => {
    const location = { protocol: 'http:', hostname: 'app.example.test' }

    expect(resolveApiUrl({ isWeb: true, apiPort: '8084', location })).toBe('http://app.example.test:8084')
  })

  it('keeps the protocol of the web app', () => {
    const location = { protocol: 'https:', hostname: 'app.example.test' }

    expect(resolveApiUrl({ isWeb: true, apiPort: '8084', location })).toBe('https://app.example.test:8084')
  })

  it('ignores the native API URL on web, so a local .env never leaks into the web build', () => {
    const location = { protocol: 'http:', hostname: 'app.example.test' }

    expect(resolveApiUrl({ isWeb: true, apiUrl: 'http://10.0.0.5:5000', location })).toBe(
      'http://app.example.test:5000',
    )
  })

  it('uses EXPO_PUBLIC_API_URL on native and drops a trailing slash', () => {
    expect(resolveApiUrl({ isWeb: false, apiUrl: 'http://10.0.0.5:5000/' })).toBe('http://10.0.0.5:5000')
  })

  it('falls back to the development server host on native', () => {
    expect(resolveApiUrl({ isWeb: false, devServerHost: '10.0.0.5:8081' })).toBe('http://10.0.0.5:5000')
  })

  it('falls back to localhost without any host information', () => {
    expect(resolveApiUrl({ isWeb: false })).toBe('http://localhost:5000')
  })
})
