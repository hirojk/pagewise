import { describe, it, expect } from 'vitest'

import { generateId } from '../utils/idGenerator.js'

describe('generateId', () => {
  it('returns a number', () => {
    expect(typeof generateId()).toBe('number')
  })

  it('returns a value between 0 and 99_999_999', () => {
    const id = generateId()
    expect(id).toBeGreaterThanOrEqual(0)
    expect(id).toBeLessThan(100_000_000)
  })

  it('generates different ids on subsequent calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBeGreaterThan(1)
  })
})
