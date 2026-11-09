import { SessionPayload } from '../utils/sessionStore.js'

declare global {
  namespace Express {
    interface Request {
      user?: SessionPayload
    }
  }
}
