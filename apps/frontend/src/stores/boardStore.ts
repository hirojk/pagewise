import { create } from 'zustand'
import type { BoardType } from '@pagewise/shared'

import { api, unwrap } from '@services/api'
import { findPage, replacePage } from '@stores/pageStore'
import { sortBoardCards } from '@utils/board'

// Board-specific data (columns, cards, settings). The board itself lives in its project's
// `components` in useProjectStore, so the project list and sidebar always show the latest.
// Generic create/rename/delete of a board is in pageStore.
type BoardState = {
  loadBoard: (projectId: number, boardId: number) => Promise<void>
  updateBoard: (
    projectId: number,
    boardId: number,
    change: (board: BoardType) => BoardType,
    options?: { persist?: boolean },
  ) => Promise<void>
}

const boardUrl = (projectId: number, boardId: number) => `/api/v1/projects/${projectId}/board/${boardId}`

const findBoard = (projectId: number, boardId: number): BoardType | undefined => {
  const page = findPage(projectId, boardId)
  return page?.type === 'board' ? page : undefined
}

export const useBoardStore = create<BoardState>(() => ({
  async loadBoard(projectId, boardId) {
    const board = await unwrap<BoardType>(api.get(boardUrl(projectId, boardId)))
    replacePage(projectId, sortBoardCards(board))
  },

  async updateBoard(projectId, boardId, change, { persist = true } = {}) {
    const board = findBoard(projectId, boardId)
    if (!board) return
    const updated = change(board)
    replacePage(projectId, updated)
    if (persist) await api.put(boardUrl(projectId, boardId), { boardData: updated })
  },
}))
