import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from './User.js'

export const sessions = pgTable(
  'sessions',
  {
    // SHA-256 of the session token; the token itself is never stored.
    tokenHash: text('token_hash').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('sessions_expires_at_idx').on(table.expiresAt)],
)
