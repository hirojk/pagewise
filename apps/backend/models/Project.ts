import { and, eq, type SQL } from 'drizzle-orm'
import { index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import type { ComponentType } from '@pagewise/shared'
import { db } from '../db/index.js'
import type { SessionPayload } from '../types/sessionTypes.js'
import { isAdmin } from '../utils/helpers.js'
import { users } from './User.js'

export const projects = pgTable(
  'projects',
  {
    id: integer('id').primaryKey(),
    name: text('name').notNull().default(''),
    creatorId: integer('creator_id')
      .notNull()
      .references(() => users.id),
    components: jsonb('components').$type<ComponentType[]>().notNull().default([]),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    archivedFrom: text('archived_from'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('projects_creator_id_idx').on(table.creatorId)],
)

export const accessibleBy = (user: SessionPayload): SQL | undefined =>
  isAdmin(user) ? undefined : eq(projects.creatorId, user.id)


export const changeProjectComponents = async <T>(
  projectId: number,
  user: SessionPayload,
  change: (components: ComponentType[]) => T | undefined,
): Promise<{ result: T | undefined } | null> => {
  return db.transaction(async (tx) => {
    const [project] = await tx
      .select()
      .from(projects)
      .where(and(eq(projects.id, projectId), accessibleBy(user)))
      .for('update')
    if (!project) return null

    const result = change(project.components)
    if (result !== undefined) {
      await tx.update(projects).set({ components: project.components }).where(eq(projects.id, projectId))
    }

    return { result }
  })
}
