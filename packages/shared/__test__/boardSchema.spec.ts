import { describe, it, expect } from 'vitest'
import { BoardSchema, BoardCardSchema } from '../schemas/boardSchema.js'

const validBoard = {
  id: 1,
  creatorId: 42,
}

describe('BoardSchema', () => {
  it('parses a valid board with defaults', () => {
    const result = BoardSchema.parse(validBoard)
    expect(result.type).toBe('board')
    expect(result.columns).toEqual([])
    expect(result.members).toEqual([])
  })

  it('fails without required fields', () => {
    expect(() => BoardSchema.parse({})).toThrow()
  })
})

describe('BoardCardSchema', () => {
  it('fails with invalid priority', () => {
    expect(() =>
      BoardCardSchema.parse({
        id: 1,
        startDate: new Date(),
        deadline: new Date(),
        priority: 'Invalid',
      }),
    ).toThrow()
  })

  it('accepts valid priority values', () => {
    const card = BoardCardSchema.parse({
      id: 1,
      startDate: new Date(),
      deadline: new Date(),
      priority: 'High',
    })
    expect(card.priority).toBe('High')
  })
})
