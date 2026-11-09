import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { APP_ENV_VALUES } from '@pagewise/shared'

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]'])

const isAllowedOrigin = (origin: string): boolean => {
  const allowed = (process.env.FRONTEND_URL || 'http://localhost:8081').split(',').map((url) => url.trim())
  if (allowed.includes(origin)) return true

  if (process.env.APP_ENV !== APP_ENV_VALUES.DEVELOPMENT) return false
  try {
    const { protocol, hostname } = new URL(origin)
    return protocol === 'http:' && LOCAL_HOSTNAMES.has(hostname)
  } catch {
    return false
  }
}

export const registerMiddleware = (app: express.Application): void => {
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      callback(null, !origin || isAllowedOrigin(origin))
    },
    credentials: true,
  }

  app.options('/{*path}', cors(corsOptions))
  app.use(cors(corsOptions))
  app.use(express.json())
  app.use(cookieParser())
}
