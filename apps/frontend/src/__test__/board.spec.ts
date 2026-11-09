import { describe, expect, it } from 'vitest'
import { BoardSchema, type BoardCardType, type BoardType } from '@pagewise/shared'

import { sortedCardsByPriority } from '@constants/priority'
import {
  addCard,
  addColumn,
  createCard,
  createColumn,
  findCard,
  moveColumn,
  moveItem,
  removeCard,
  removeColumn,
  renameColumn,
  sortBoardCards,
  updateCard,
  updateSettings,
} from '@utils/board'

const card = (id: number, priority: BoardCardType['priority'], name = `card ${id}`) =>
  createCard({ id, priority, name })

const boardWith = (...columns: ReturnType<typeof createColumn>[]): BoardType =>
  BoardSchema.parse({ id: 1, creatorId: 1, name: 'Board', columns })

describe('sortedCardsByPriority', () => {
  it('orders Critical, High, Medium, Low', () => {
    const cards = [card(1, 'Low'), card(2, 'Critical'), card(3, 'Medium'), card(4, 'High')]

    expect(sortedCardsByPriority(cards).map((item) => item.priority)).toEqual(['Critical', 'High', 'Medium', 'Low'])
  })

  it('keeps the order of cards with the same priority', () => {
    const cards = [card(1, 'High'), card(2, 'Low'), card(3, 'High')]

    expect(sortedCardsByPriority(cards).map((item) => item.id)).toEqual([1, 3, 2])
  })

  it('does not change the original list', () => {
    const cards = [card(1, 'Low'), card(2, 'Critical')]

    sortedCardsByPriority(cards)

    expect(cards.map((item) => item.id)).toEqual([1, 2])
  })
})

describe('board changes', () => {
  const todo = createColumn({ id: 10, name: 'Todo', cards: [card(1, 'Low'), card(2, 'Critical')] })
  const done = createColumn({ id: 20, name: 'Done' })
  const board = boardWith(todo, done)

  it('creates a column and a card with defaults', () => {
    expect(createColumn()).toMatchObject({ name: '', cards: [] })
    expect(createCard()).toMatchObject({ name: '', priority: 'Medium', description: '', checklist: [] })
  })

  it('adds, renames and removes columns without touching the original board', () => {
    const added = addColumn(board, createColumn({ id: 30 }))

    expect(added.columns.map((column) => column.id)).toEqual([10, 20, 30])
    expect(renameColumn(board, 20, 'Finished').columns[1]?.name).toBe('Finished')
    expect(removeColumn(board, 10).columns.map((column) => column.id)).toEqual([20])
    expect(board.columns).toHaveLength(2)
  })

  it('moves a column', () => {
    const third = createColumn({ id: 30 })
    const moved = moveColumn(boardWith(todo, done, third), 0, 2)

    expect(moved.columns.map((column) => column.id)).toEqual([20, 30, 10])
  })

  it('returns the same board when a column is moved onto itself', () => {
    expect(moveColumn(board, 1, 1)).toBe(board)
  })

  it('adds, updates and removes a card in one column', () => {
    const withCard = addCard(board, 20, card(3, 'High'))
    expect(withCard.columns[1]?.cards.map((item) => item.id)).toEqual([3])

    const updated = updateCard(withCard, [20, 3], { name: 'Ship it', priority: 'Low' })
    expect(findCard(updated, [20, 3])).toMatchObject({ name: 'Ship it', priority: 'Low' })

    expect(findCard(removeCard(updated, [20, 3]), [20, 3])).toBeUndefined()
  })

  it('sorts the cards of every column by priority', () => {
    expect(sortBoardCards(board).columns[0]?.cards.map((item) => item.id)).toEqual([2, 1])
  })

  it('hides a part on the cards when it is turned off in the modal', () => {
    const shown = updateSettings(board, 'cards', 'description', true)
    expect(shown.settings.cards.description).toBe(true)

    const disabled = updateSettings(shown, 'modal', 'description', false)
    expect(disabled.settings.modal.description).toBe(false)
    expect(disabled.settings.cards.description).toBe(false)
  })

  it('keeps the card setting when a modal part is turned on', () => {
    const shown = updateSettings(board, 'cards', 'priority', true)

    expect(updateSettings(shown, 'modal', 'priority', true).settings.cards.priority).toBe(true)
  })
})

describe('moveItem', () => {
  it('moves an item to another position', () => {
    expect(moveItem([1, 2, 3, 4], 0, 2)).toEqual([2, 3, 1, 4])
    expect(moveItem([1, 2, 3, 4], 3, 0)).toEqual([4, 1, 2, 3])
  })

  it('returns the same list when nothing moves', () => {
    const items = [1, 2, 3]

    expect(moveItem(items, 1, 1)).toBe(items)
    expect(moveItem(items, 5, 0)).toBe(items)
  })
})
