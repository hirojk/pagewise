import type { ComponentType } from '../schemas/projectSchema.js'

/**
 * Every kind of page a project can contain (the `type` of each entry in a project's
 * `components`). Data only, so the backend can use it too; the client maps each type
 * to its screen and icon separately.
 *
 * `satisfies Record<ComponentType['type'], …>`: adding a new schema to ComponentSchema
 * without an entry here is a type error.
 */

export const PAGE_TYPES = {
  board: { label: 'Board', apiPath: 'board' },
} as const satisfies Record<ComponentType['type'], { label: string; apiPath: string }>

export type PageTypeKey = keyof typeof PAGE_TYPES
