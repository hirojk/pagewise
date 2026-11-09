import { PRIORITY_VALUES, type BoardCardType, type PriorityType } from '@pagewise/shared'

import type { IconName } from '@components/ui/Icon'

export const PRIORITY_LIST: { name: PriorityType; icon: IconName }[] = [
  { name: 'Critical', icon: 'critical' },
  { name: 'High', icon: 'high' },
  { name: 'Medium', icon: 'medium' },
  { name: 'Low', icon: 'low' },
]

export const getPriorityIcon = (priority: PriorityType = 'Medium'): IconName =>
  PRIORITY_LIST.find((item) => item.name === priority)?.icon ?? 'medium'

export const sortedCardsByPriority = (cards: BoardCardType[]): BoardCardType[] =>
  [...cards].sort(
    (a, b) => PRIORITY_VALUES.indexOf(a.priority ?? 'Medium') - PRIORITY_VALUES.indexOf(b.priority ?? 'Medium'),
  )
