import { getTableColumns } from 'drizzle-orm'
import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { ROLE_VALUES, type UserType } from '@pagewise/shared'

export const ADMIN_USER_ID = 1

export const users = pgTable('users', {
  id: integer('id').primaryKey(),
  username: text('username').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull().default(''),
  password: text('password').notNull(),
  role: text('role').$type<UserType['role']>().notNull().default(ROLE_VALUES.USER),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

const { password: _password, ...publicColumns } = getTableColumns(users)
export const publicUserColumns = publicColumns
