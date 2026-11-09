import { z } from 'zod'
import { PRIORITY_VALUES, DEFAULT_PRIORITY } from '../constants/priority.js'

export const BoardSettingSchema = z.object({
  cards: z
    .object({
      priority: z.boolean(),
      description: z.boolean(),
      checklist: z.boolean(),
    })
    .default({ priority: true, description: false, checklist: false }),
  modal: z
    .object({
      priority: z.boolean(),
      description: z.boolean(),
      checklist: z.boolean(),
    })
    .default({ priority: true, description: true, checklist: true }),
})

export const CheckboxItemSchema = z.object({
  isChecked: z.boolean().default(false),
  label: z.string(),
})

export const BoardTagSchema = z.object({
  label: z.string(),
  color: z.string(),
})

export const BoardCardSchema = z.object({
  id: z.number(),
  name: z.string().default(''),
  priority: z.enum(PRIORITY_VALUES).default(DEFAULT_PRIORITY),
  description: z.string().default(''),
  checklist: z.array(CheckboxItemSchema).default([]),
  startDate: z.coerce.date(),
  deadline: z.coerce.date(),
  tags: z.array(BoardTagSchema).default([]),
})

export const BoardColumnSchema = z.object({
  id: z.number(),
  name: z.string().default(''),
  cards: z.array(BoardCardSchema).default([]),
})

export const BoardSchema = z.object({
  id: z.number(),
  type: z.literal('board').default('board'),
  name: z.string().default(''),
  creatorId: z.number(),
  members: z.array(z.number()).default([]),
  columns: z.array(BoardColumnSchema).default([]),
  settings: BoardSettingSchema.default(() => BoardSettingSchema.parse({})),
})

export type BoardSettingType = z.infer<typeof BoardSettingSchema>
export type CheckboxItemType = z.infer<typeof CheckboxItemSchema>
export type BoardTagType = z.infer<typeof BoardTagSchema>
export type BoardCardType = z.infer<typeof BoardCardSchema>
export type BoardColumnType = z.infer<typeof BoardColumnSchema>
export type BoardType = z.infer<typeof BoardSchema>
