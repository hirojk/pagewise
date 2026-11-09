import bcrypt from 'bcrypt'

import { Request, Response } from 'express'
import { asc, eq } from 'drizzle-orm'
import { LoginSchema, UserSchema, generateId } from '@pagewise/shared'
import { db, hasPgErrorCode, PG_UNIQUE_VIOLATION } from '../db/index.js'
import { projects } from '../models/Project.js'
import { ADMIN_USER_ID, publicUserColumns, users } from '../models/User.js'
import { renameUserToLowercase, issueSession, getSessionToken, isAdmin, parseId } from '../utils/helpers.js'
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse,
  forbiddenResponse,
  notAuthenticatedResponse,
  serverFailureResponse,
} from '../utils/responses.js'
import { sessionStore } from '../utils/sessionStore.js'

// POST: create new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, name, password } = req.body

    const lowCaseUserName = renameUserToLowercase(username)
    const hashedPassword = await bcrypt.hash(password as string, 12)

    const userData = UserSchema.parse({
      id: generateId(),
      username: lowCaseUserName,
      name,
      password: hashedPassword,
    })
    const [newUser] = await db.insert(users).values(userData).returning(publicUserColumns)

    createdResponse(res, 'User created successfully', newUser)
  } catch (error) {
    if (hasPgErrorCode(error, PG_UNIQUE_VIOLATION)) {
      badRequestResponse(res, 'User already exists')
      return
    }
    serverFailureResponse(res, (error as Error).message)
  }
}

// Compared against when the username doesn't exist, so a wrong username takes as long as a wrong password.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('pagewise-dummy-password', 10)

// POST: login user
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const credentials = LoginSchema.safeParse(req.body)
    if (!credentials.success) {
      badRequestResponse(res, 'Username and password are required')
      return
    }
    const { username, password } = credentials.data

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, renameUserToLowercase(username)))

    const isValid = await bcrypt.compare(password, user?.password ?? DUMMY_PASSWORD_HASH)
    if (!user || !isValid) {
      notAuthenticatedResponse(res, 'Invalid username or password')
      return
    }

    const { password: _password, ...userPayload } = user
    const token = await issueSession(res, userPayload)
    successResponse(res, 'Login successful', { sessionToken: token })
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}

// POST: logout user
export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = getSessionToken(req)
    if (token) {
      await sessionStore.delete(token)
    }
    res.clearCookie('sessionToken')
    successResponse(res, 'Logged out successfully')
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}

// GET: get my session
export const getMe = (req: Request, res: Response): void => {
  successResponse(res, undefined, req.user)
}

// GET: get all users
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const allUsers = await db.select(publicUserColumns).from(users).orderBy(asc(users.createdAt), asc(users.id))

    successResponse(res, undefined, {
      userCount: allUsers.length,
      users: allUsers,
    })
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}

// GET: search single user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseId(req.params.id)
    if (!isAdmin(req.user!) && req.user!.id !== userId) {
      forbiddenResponse(res, 'You can only view your own user')
      return
    }

    const [user] = await db.select(publicUserColumns).from(users).where(eq(users.id, userId))

    if (!user) {
      notFoundResponse(res, 'User not found')
      return
    }

    successResponse(res, undefined, user)
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}

// DELETE: delete user by ID. Their projects move to the admin's archive.
export const deleteUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseId(req.params.id)
    if (userId === ADMIN_USER_ID) {
      forbiddenResponse(res, 'The admin user cannot be deleted')
      return
    }

    const archivedCount = await db.transaction(async (tx) => {
      const [user] = await tx.select({ username: users.username }).from(users).where(eq(users.id, userId)).for('update')
      if (!user) return null

      const archived = await tx
        .update(projects)
        .set({ creatorId: ADMIN_USER_ID, archivedAt: new Date(), archivedFrom: user.username })
        .where(eq(projects.creatorId, userId))
        .returning({ id: projects.id })
      await tx.delete(users).where(eq(users.id, userId))

      return archived.length
    })

    if (archivedCount === null) {
      notFoundResponse(res, 'User not found')
      return
    }

    const moved = archivedCount === 1 ? '1 project' : `${archivedCount} projects`
    successResponse(res, `User deleted; ${moved} moved to the archive`)
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}

// PUT: update user by ID
export const updateUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseId(req.params.id)
    if (!isAdmin(req.user!) && req.user!.id !== userId) {
      forbiddenResponse(res, 'You can only change your own user')
      return
    }
    if (userId === ADMIN_USER_ID) {
      forbiddenResponse(res, 'The admin user is managed through ADMIN_USER and ADMIN_PASS')
      return
    }

    const { username } = req.body
    if (typeof username !== 'string' || !username.trim()) {
      badRequestResponse(res, 'Username is required')
      return
    }
    const lowCaseUserName = renameUserToLowercase(username.trim())

    const [user] = await db
      .update(users)
      .set({ username: lowCaseUserName })
      .where(eq(users.id, userId))
      .returning(publicUserColumns)

    if (!user) {
      notFoundResponse(res, 'User not found')
      return
    }

    successResponse(res, 'User updated successfully', user)
  } catch (error) {
    if (hasPgErrorCode(error, PG_UNIQUE_VIOLATION)) {
      badRequestResponse(res, 'User already exists')
      return
    }
    serverFailureResponse(res, (error as Error).message)
  }
}
