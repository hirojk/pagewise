import {
  BoardCardSchema,
  BoardColumnSchema,
  generateId,
  type BoardCardType,
  type BoardColumnType,
  type BoardSettingType,
  type BoardType,
} from '@pagewise/shared'

import { sortedCardsByPriority } from '@constants/priority'

export type CardRef = [columnId: number, cardId: number]

export const createColumn = (overrides: Partial<BoardColumnType> = {}): BoardColumnType =>
  BoardColumnSchema.parse({ id: generateId(), ...overrides })

export const createCard = (overrides: Partial<BoardCardType> = {}): BoardCardType =>
  BoardCardSchema.parse({ id: generateId(), startDate: new Date(), deadline: new Date(), ...overrides })

const mapColumn = (board: BoardType, columnId: number, change: (column: BoardColumnType) => BoardColumnType) => ({
  ...board,
  columns: board.columns.map((column) => (column.id === columnId ? change(column) : column)),
})

export const addColumn = (board: BoardType, column: BoardColumnType): BoardType => ({
  ...board,
  columns: [...board.columns, column],
})

export const renameColumn = (board: BoardType, columnId: number, name: string): BoardType =>
  mapColumn(board, columnId, (column) => ({ ...column, name }))

export const removeColumn = (board: BoardType, columnId: number): BoardType => ({
  ...board,
  columns: board.columns.filter((column) => column.id !== columnId),
})

export const moveItem = <T>(items: T[], from: number, to: number): T[] => {
  if (from === to || from < 0 || from >= items.length) return items
  const result = [...items]
  const [moved] = result.splice(from, 1)
  result.splice(Math.max(0, Math.min(to, result.length)), 0, moved as T)
  return result
}

export const moveColumn = (board: BoardType, from: number, to: number): BoardType => {
  const columns = moveItem(board.columns, from, to)
  return columns === board.columns ? board : { ...board, columns }
}

export const addCard = (board: BoardType, columnId: number, card: BoardCardType): BoardType =>
  mapColumn(board, columnId, (column) => ({ ...column, cards: [...column.cards, card] }))

export const updateCard = (board: BoardType, [columnId, cardId]: CardRef, updates: Partial<BoardCardType>): BoardType =>
  mapColumn(board, columnId, (column) => ({
    ...column,
    cards: column.cards.map((card) => (card.id === cardId ? { ...card, ...updates } : card)),
  }))

export const removeCard = (board: BoardType, [columnId, cardId]: CardRef): BoardType =>
  mapColumn(board, columnId, (column) => ({ ...column, cards: column.cards.filter((card) => card.id !== cardId) }))

export const findCard = (board: BoardType | undefined, [columnId, cardId]: CardRef) =>
  board?.columns.find((column) => column.id === columnId)?.cards.find((card) => card.id === cardId)

export type SettingKey = keyof BoardSettingType['cards']

export const updateSettings = (
  board: BoardType,
  section: keyof BoardSettingType,
  key: SettingKey,
  value: boolean,
): BoardType => {
  const settings = { ...board.settings, [section]: { ...board.settings[section], [key]: value } }
  if (section === 'modal' && !value) settings.cards = { ...settings.cards, [key]: false }
  return { ...board, settings }
}

export const sortBoardCards = (board: BoardType): BoardType => ({
  ...board,
  columns: board.columns.map((column) => ({ ...column, cards: sortedCardsByPriority(column.cards) })),
})
