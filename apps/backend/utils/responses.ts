import { Response } from 'express'
import { APP_ENV_VALUES } from '@pagewise/shared'

const isDevelopment = process.env.APP_ENV === APP_ENV_VALUES.DEVELOPMENT

export const successResponse = (res: Response, messagetext?: string, data?: unknown): void => {
  res.status(200).json({
    success: true,
    message: messagetext,
    data,
  })
}

export const createdResponse = (res: Response, messagetext?: string, data?: unknown): void => {
  res.status(201).json({
    success: true,
    message: messagetext,
    data,
  })
}

export const badRequestResponse = (res: Response, messagetext: string): void => {
  res.status(400).json({
    success: false,
    error: messagetext,
  })
}

export const notAuthenticatedResponse = (res: Response, messagetext: string): void => {
  res.status(401).json({
    success: false,
    error: messagetext,
  })
}

export const forbiddenResponse = (res: Response, messagetext: string): void => {
  res.status(403).json({
    success: false,
    error: messagetext,
  })
}

export const notFoundResponse = (res: Response, messagetext: string): void => {
  res.status(404).json({
    success: false,
    error: messagetext,
  })
}

export const serverFailureResponse = (res: Response, messagetext: string): void => {
  res.status(500).json({
    success: false,
    error: isDevelopment ? messagetext : undefined,
  })
}

export const serviceUnavailableResponse = (res: Response, messagetext: string): void => {
  res.status(503).json({
    success: false,
    error: isDevelopment ? messagetext : undefined,
  })
}

export const tooManyRequestsResponse = (res: Response, messagetext: string, retryAfterSeconds: number): void => {
  res.setHeader('Retry-After', String(retryAfterSeconds))
  res.status(429).json({
    success: false,
    error: messagetext,
    retryAfter: retryAfterSeconds,
  })
}
