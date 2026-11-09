import { Request, Response } from 'express'
import { and, eq } from 'drizzle-orm'
import { BoardSchema, CreateItemSchema, generateId, type BoardType, type ComponentType } from '@pagewise/shared'
import { db } from '../db/index.js'
import { accessibleBy, changeProjectComponents, projects } from '../models/Project.js'
import { parseId } from '../utils/helpers.js'

import {
  successResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse,
  serverFailureResponse,
} from '../utils/responses.js'

const findBoardIndex = (components: ComponentType[], boardId: number): number =>
  components.findIndex((component) => component.type === 'board' && component.id === boardId)

// POST: create new board component
export const createBoardComponent = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = CreateItemSchema.safeParse(req.body ?? {})
    if (!body.success) {
      badRequestResponse(res, 'Invalid board data')
      return
    }

    const newBoard = BoardSchema.parse({
      id: generateId(),
      creatorId: req.user!.id,
      name: body.data.name,
    })

    const change = await changeProjectComponents(parseId(req.params.projectId), req.user!, (components) => {
      components.push(newBoard)
      return newBoard
    })
    if (!change) {
      notFoundResponse(res, 'Project not found')
      return
    }

    createdResponse(res, 'New Board created successfully', newBoard)
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}

// GET: get board by id
export const getBoardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const [project] = await db
      .select({ components: projects.components })
      .from(projects)
      .where(and(eq(projects.id, parseId(req.params.projectId)), accessibleBy(req.user!)))
    if (!project) {
      notFoundResponse(res, 'Project not found')
      return
    }

    const board = project.components[findBoardIndex(project.components, parseId(req.params.boardId))]
    if (!board) {
      notFoundResponse(res, 'Board not found')
      return
    }

    successResponse(res, undefined, board)
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}

// DELETE: delete board by ID
export const deleteBoardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const boardId = parseId(req.params.boardId)

    const change = await changeProjectComponents(parseId(req.params.projectId), req.user!, (components) => {
      const boardIndex = findBoardIndex(components, boardId)
      return boardIndex === -1 ? undefined : components.splice(boardIndex, 1)[0]
    })
    if (!change) {
      notFoundResponse(res, 'Project not found')
      return
    }
    if (!change.result) {
      notFoundResponse(res, 'Board not found')
      return
    }

    successResponse(res, 'Board deleted successfully')
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}

// PUT: update board name and data
export const updateBoardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = parseId(req.params.projectId)
    const boardId = parseId(req.params.boardId)
    const { name, boardData } = req.body

    if (name) {
      const change = await changeProjectComponents(projectId, req.user!, (components) => {
        const board = components[findBoardIndex(components, boardId)]
        if (!board) return undefined
        board.name = name
        return board
      })
      if (!change?.result) {
        notFoundResponse(res, 'Board not found')
        return
      }

      successResponse(res, 'Board name updated', { name })
      return
    }

    if (boardData) {
      const parsedBoard = BoardSchema.safeParse({ ...boardData, id: boardId, type: 'board' })
      if (!parsedBoard.success) {
        badRequestResponse(res, 'Invalid board data')
        return
      }
      const updatedBoard: BoardType = parsedBoard.data

      const change = await changeProjectComponents(projectId, req.user!, (components) => {
        const boardIndex = findBoardIndex(components, boardId)
        if (boardIndex === -1) return undefined
        components[boardIndex] = updatedBoard
        return updatedBoard
      })
      if (!change) {
        notFoundResponse(res, 'Project not found')
        return
      }
      if (!change.result) {
        notFoundResponse(res, 'Board not found')
        return
      }

      successResponse(res, 'Board updated successfully', updatedBoard)
      return
    }

    badRequestResponse(res, 'Either boardName or boardData is required')
  } catch (error) {
    serverFailureResponse(res, (error as Error).message)
  }
}
