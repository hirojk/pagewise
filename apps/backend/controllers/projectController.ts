import { Request, Response } from 'express'
import { and, asc, desc, eq, isNotNull, isNull } from 'drizzle-orm'
import { CreateItemSchema, ProjectSchema, UpdateProjectSchema, generateId } from '@pagewise/shared'
import { db } from '../db/index.js'
import { accessibleBy, projects } from '../models/Project.js'
import { users } from '../models/User.js'
import { isAdmin, parseId } from '../utils/helpers.js'

import {
  successResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse,
  forbiddenResponse,
  serverFailureResponse,
} from '../utils/responses.js'

// POST: create new project
export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = CreateItemSchema.safeParse(req.body ?? {})
    if (!body.success) {
      badRequestResponse(res, 'Invalid project data')
      return
    }

    const projectData = ProjectSchema.parse({
      id: generateId(),
      creatorId: req.user!.id,
      name: body.data.name,
    })
    const [newProject] = await db.insert(projects).values(projectData).returning()

    createdResponse(res, 'Project created successfully', newProject)
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}

// GET: get single project by ID
export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, parseId(req.params.projectId)), accessibleBy(req.user!)))
    if (!project) {
      notFoundResponse(res, 'Project not found')
      return
    }

    successResponse(res, undefined, project)
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}

// A user's projects, without archived ones, in creation order
const findActiveProjects = async (userId: number) => {
  const userProjects = await db
    .select()
    .from(projects)
    .where(and(eq(projects.creatorId, userId), isNull(projects.archivedAt)))
    .orderBy(asc(projects.createdAt), asc(projects.id))

  return { projectCount: userProjects.length, projects: userProjects }
}

// GET: get all projects of the logged-in user
export const getAllProjectsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    successResponse(res, undefined, await findActiveProjects(req.user!.id))
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}

// GET: get all projects of a user by ID (the admin for anyone, everyone else only for themselves)
export const getProjectsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseId(req.params.userId)
    if (!isAdmin(req.user!) && req.user!.id !== userId) {
      forbiddenResponse(res, 'You can only view your own projects')
      return
    }

    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId))
    if (!user) {
      notFoundResponse(res, 'User not found')
      return
    }

    successResponse(res, undefined, await findActiveProjects(userId))
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}

// GET: projects of deleted users, kept for the admin (admin only)
export const getArchivedProjects = async (_req: Request, res: Response): Promise<void> => {
  try {
    const archivedProjects = await db
      .select()
      .from(projects)
      .where(isNotNull(projects.archivedAt))
      .orderBy(desc(projects.archivedAt), asc(projects.id))

    successResponse(res, undefined, {
      projectCount: archivedProjects.length,
      projects: archivedProjects,
    })
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}

// POST: take a project out of the archive, into the admin's own projects (admin only)
export const restoreArchivedProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const [project] = await db
      .update(projects)
      .set({ archivedAt: null, archivedFrom: null })
      .where(and(eq(projects.id, parseId(req.params.projectId)), isNotNull(projects.archivedAt)))
      .returning()
    if (!project) {
      notFoundResponse(res, 'Archived project not found')
      return
    }

    successResponse(res, 'Project restored successfully', project)
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}

// DELETE: delete project by ID
export const deleteProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const [project] = await db
      .delete(projects)
      .where(and(eq(projects.id, parseId(req.params.projectId)), accessibleBy(req.user!)))
      .returning({ id: projects.id })
    if (!project) {
      notFoundResponse(res, 'Project not found')
      return
    }

    successResponse(res, 'Project deleted successfully')
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}

// PUT: update project by ID
export const updateProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const changes = UpdateProjectSchema.safeParse(req.body)
    if (!changes.success) {
      badRequestResponse(res, 'Invalid project data')
      return
    }

    const [project] = await db
      .update(projects)
      .set({ ...changes.data, updatedAt: new Date() })
      .where(and(eq(projects.id, parseId(req.params.projectId)), accessibleBy(req.user!)))
      .returning()

    if (!project) {
      notFoundResponse(res, 'Project not found')
      return
    }

    successResponse(res, 'Project updated successfully', project)
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}
