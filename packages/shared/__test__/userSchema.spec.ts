import { describe, it, expect } from 'vitest'

import { UserSchema } from '../schemas/userSchema.js'

const validUser = {
  id: 1,
  username: 'jan',
  name: 'Jan',
  password: 'hashed',
}

describe('UserSchema', () => {
  it('parses a valid user', () => {
    const result = UserSchema.parse(validUser)
    expect(result.username).toBe('jan')
    expect(result.role).toBe('user')
    expect(result.email).toBe('')
  })

  it('fails without required fields', () => {
    expect(() => UserSchema.parse({})).toThrow()
  })

  it('fails with invalid email', () => {
    expect(() => UserSchema.parse({ ...validUser, email: 'not-an-email' })).toThrow()
  })
})
