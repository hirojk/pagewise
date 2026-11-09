import { Router } from 'express'
import { rateLimit, type AugmentedRequest } from 'express-rate-limit'
import { loginUser, logoutUser } from '../controllers/userController.js'
import { tooManyRequestsResponse } from '../utils/responses.js'

const LOGIN_WINDOW = 5 * 60 * 1000
const MAX_FAILED_LOGINS = 10

export const createAuthRouter = (): Router => {
  const router = Router()

  const loginLimiter = rateLimit({
    windowMs: LOGIN_WINDOW,
    limit: MAX_FAILED_LOGINS,
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => {
      const resetTime = (req as AugmentedRequest).rateLimit?.resetTime?.getTime() ?? Date.now() + LOGIN_WINDOW
      const retryAfter = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000))
      const minutes = Math.ceil(retryAfter / 60)
      const wait = minutes === 1 ? '1 minute' : `${minutes} minutes`

      tooManyRequestsResponse(res, `Too many failed logins. Try again in ${wait}.`, retryAfter)
    },
  })

  router.post('/login', loginLimiter, loginUser)
  router.post('/logout', logoutUser)

  return router
}
