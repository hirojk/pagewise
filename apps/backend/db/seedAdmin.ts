import bcrypt from 'bcrypt'
import { ROLE_VALUES } from '@pagewise/shared'
import { db } from './index.js'
import { ADMIN_USER_ID, users } from '../models/User.js'
import { renameUserToLowercase } from '../utils/helpers.js'

export const seedAdmin = async (): Promise<void> => {
  const admin = {
    username: renameUserToLowercase(process.env.ADMIN_USER || ''),
    name: 'Admin',
    password: await bcrypt.hash(process.env.ADMIN_PASS || '', 12),
    role: ROLE_VALUES.ADMIN,
  }

  await db
    .insert(users)
    .values({ id: ADMIN_USER_ID, ...admin })
    .onConflictDoUpdate({ target: users.id, set: admin })
}
