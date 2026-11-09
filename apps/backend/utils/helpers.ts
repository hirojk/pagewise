import crypto from 'crypto'
import { Request, Response } from 'express'
import { ROLE_VALUES } from '@pagewise/shared'
import { sessionStore } from './sessionStore.js'
import { SessionPayload } from '../types/sessionTypes.js'

export const maxSessionDuration = 7 * 24 * 60 * 60 * 1000

const POSTGRES_INTEGER_MAX = 2_147_483_647
const NO_SUCH_ID = -1

export const parseId = (value: unknown): number => {
  const id = Number(value)
  return Number.isInteger(id) && id >= 0 && id <= POSTGRES_INTEGER_MAX ? id : NO_SUCH_ID
}

export const getSessionToken = (req: Request): string | undefined => {
  return req.cookies.sessionToken || req.headers.authorization?.replace('Bearer ', '')
}

export const isAdmin = (user: Pick<SessionPayload, 'role'>): boolean => user.role === ROLE_VALUES.ADMIN

export const hashToken = (token: string): string => crypto.createHash('sha256').update(token).digest('hex')

export const renameUserToLowercase = (username: string): string => {
  return username.toLowerCase()
}

export const createOpaqueToken = async (payload: SessionPayload): Promise<string> => {
  const token = crypto.randomBytes(32).toString('hex')
  await sessionStore.set(token, payload)
  return token
}

export const issueSession = async (res: Response, payload: SessionPayload): Promise<string> => {
  const token = await createOpaqueToken(payload)
  setSessionCookie(res, token)
  return token
}

export const setSessionCookie = (res: Response, token: string): void => {
  const secure = process.env.COOKIE_SECURE !== 'false'

  res.cookie('sessionToken', token, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: maxSessionDuration,
  })
}
