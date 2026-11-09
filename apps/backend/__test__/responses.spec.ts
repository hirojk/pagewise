import { describe, it, expect, vi } from 'vitest'
import type { Response } from 'express'

import { successResponse, badRequestResponse, notFoundResponse } from '../utils/responses.js'

const mockRes = () => {
  const res = {} as Response
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('responses', () => {
  it('successResponse sends 200 with data', () => {
    const res = mockRes()
    successResponse(res, 'ok', { id: 1 })
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'ok', data: { id: 1 } })
  })

  it('badRequestResponse sends 400', () => {
    const res = mockRes()
    badRequestResponse(res, 'Invalid input')
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Invalid input' })
  })

  it('notFoundResponse sends 404', () => {
    const res = mockRes()
    notFoundResponse(res, 'Not found')
    expect(res.status).toHaveBeenCalledWith(404)
  })
})
