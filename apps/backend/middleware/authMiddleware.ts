import { ROLE_VALUES } from '@pagewise/shared'

import { Request, Response, NextFunction } from 'express'
import { notAuthenticatedResponse } from '../utils/responses.js'
import { getSessionToken } from '../utils/helpers.js'
import { sessionStore } from '../utils/sessionStore.js'

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = getSessionToken(req)

  if (!token) {
    notAuthenticatedResponse(res, 'No session token provided')
    return
  }

  const user = await sessionStore.get(token)
  if (!user) {
    notAuthenticatedResponse(res, 'Invalid or expired session token')
    return
  }

  req.user = user
  next()
}

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== ROLE_VALUES.ADMIN) {
    return notAuthenticatedResponse(res, 'Admin access required')
  }
  next()
}
