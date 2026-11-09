import { z } from 'zod'
import { BoardSchema } from './boardSchema.js'

export const ComponentSchema = z.discriminatedUnion('type', [BoardSchema])

export const ProjectSchema = z.object({
  id: z.number(),
  name: z.string().default(''),
  creatorId: z.number(),
  components: z.array(ComponentSchema).default([]),
})

export const CreateItemSchema = z.object({
  name: z.string().trim().default(''),
})

export const UpdateProjectSchema = z.object({
  name: z.string().optional(),
  components: z.array(ComponentSchema).optional(),
})

export type ComponentType = z.infer<typeof ComponentSchema>
export type ProjectType = z.infer<typeof ProjectSchema>
