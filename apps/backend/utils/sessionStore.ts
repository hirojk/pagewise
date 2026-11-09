import { and, eq, gt, lte } from 'drizzle-orm'
import { db } from '../db/index.js'
import { sessions } from '../models/Session.js'
import { users } from '../models/User.js'
import type { SessionPayload } from '../types/sessionTypes.js'
import { hashToken, maxSessionDuration } from './helpers.js'

export const sessionStore = {
  set: async (token: string, data: SessionPayload, expiresIn: number = maxSessionDuration): Promise<void> => {
    await db
      .insert(sessions)
      .values({ tokenHash: hashToken(token), userId: data.id, expiresAt: new Date(Date.now() + expiresIn) })
  },

  get: async (token: string): Promise<SessionPayload | null> => {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    return user ?? null
  },

  delete: async (token: string): Promise<void> => {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)))
  },

  deleteExpired: async (): Promise<void> => {
    await db.delete(sessions).where(lte(sessions.expiresAt, new Date()))
  },
}
