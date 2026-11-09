import { afterEach, describe, it, expect, vi } from 'vitest'
import type { Response } from 'express'

import { renameUserToLowercase, setSessionCookie } from '../utils/helpers.js'

describe('setSessionCookie', () => {
  const cookieOptions = () => {
    const cookie = vi.fn()
    setSessionCookie({ cookie } as unknown as Response, 'token')
    return cookie.mock.calls[0][2]
  }

  afterEach(() => {
    delete process.env.COOKIE_SECURE
  })

  it('uses a secure SameSite=Lax cookie by default', () => {
    expect(cookieOptions()).toMatchObject({ httpOnly: true, secure: true, sameSite: 'lax' })
  })

  it('uses a plain HTTP cookie when COOKIE_SECURE is false', () => {
    process.env.COOKIE_SECURE = 'false'

    expect(cookieOptions()).toMatchObject({ httpOnly: true, secure: false, sameSite: 'lax' })
  })
})

describe('renameUserToLowercase', () => {
  it('converts uppercase to lowercase', () => {
    expect(renameUserToLowercase('ADMIN')).toBe('admin')
  })

  it('leaves lowercase unchanged', () => {
    expect(renameUserToLowercase('jan')).toBe('jan')
  })

  it('handles mixed case', () => {
    expect(renameUserToLowercase('JanKolar')).toBe('jankolar')
  })
})
