import { describe, it, expect } from 'vitest'

import { ProjectSchema, UpdateProjectSchema } from '../schemas/projectSchema.js'

describe('UpdateProjectSchema', () => {
  it('leaves fields that were not sent undefined, so they are not overwritten', () => {
    expect(UpdateProjectSchema.parse({ name: 'New name' })).toEqual({ name: 'New name' })
  })

  it('rejects unknown component types', () => {
    expect(() => UpdateProjectSchema.parse({ components: [{ type: 'unknown' }] })).toThrow()
  })
})

describe('ProjectSchema', () => {
  it('parses a valid project with defaults', () => {
    const result = ProjectSchema.parse({ id: 1, creatorId: 42, name: 'My Project' })
    expect(result.components).toEqual([])
  })

  it('fails without required fields', () => {
    expect(() => ProjectSchema.parse({ name: 'Missing id and creatorId' })).toThrow()
  })
})
