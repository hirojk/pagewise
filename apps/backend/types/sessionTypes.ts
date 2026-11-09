import { UserType } from '@pagewise/shared'

export type SessionPayload = Omit<UserType, 'password' | 'email'> & {
  email?: string
}
