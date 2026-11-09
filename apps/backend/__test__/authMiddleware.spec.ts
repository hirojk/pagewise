import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Request, Response, NextFunction } from 'express'

import { ROLE_VALUES } from '@pagewise/shared'

import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware.js'

vi.mock('../utils/sessionStore.js', () => ({
  sessionStore: {
    get: vi.fn(),
  },
}))

import { sessionStore } from '../utils/sessionStore.js'

const mockRes = () => {
  const res = {} as Response
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

const mockReq = (cookies: Record<string, string> = {}) => ({ cookies, headers: {} }) as unknown as Request

const next: NextFunction = vi.fn()

beforeEach(() => vi.clearAllMocks())

describe('authMiddleware', () => {
  it('blocks request without session token', async () => {
    const req = mockReq()
    const res = mockRes()

    await authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('blocks request with invalid token', async () => {
    vi.mocked(sessionStore.get).mockResolvedValueOnce(null)

    const req = mockReq({ sessionToken: 'invalid' })
    const res = mockRes()

    await authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next() with valid token and sets req.user', async () => {
    const payload = { id: 1, username: 'jan', name: 'Jan', role: ROLE_VALUES.USER }
    vi.mocked(sessionStore.get).mockResolvedValueOnce(payload)

    const req = mockReq({ sessionToken: 'valid-token' })
    const res = mockRes()

    await authMiddleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(req.user).toEqual(payload)
  })
})

describe('adminMiddleware', () => {
  it('blocks non-admin users', () => {
    const req = { user: { role: ROLE_VALUES.USER } } as unknown as Request
    const res = mockRes()

    adminMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('allows admin users', () => {
    const req = { user: { role: ROLE_VALUES.ADMIN } } as unknown as Request
    const res = mockRes()

    adminMiddleware(req, res, next)

    expect(next).toHaveBeenCalled()
  })
})
