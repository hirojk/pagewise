import type { ReactNode } from 'react'
import type { ComponentType as Page, PageTypeKey } from '@pagewise/shared'

import { BoardScreen } from '@components/board/BoardScreen'
import type { IconName } from '@components/ui/Icon'

// How each page type looks in the client: its icon and the screen that shows it.
// The data side (label, API path) is PAGE_TYPES in @pagewise/shared.
//
// To add a new kind of page: add its schema + PAGE_TYPES entry in packages/shared, the backend routes, then an entry here with its screen.
export type PageScreenProps<T extends Page = Page> = { projectId: number; page: T }

type PageTypeUi = {
  [K in PageTypeKey]: {
    icon: IconName
    render: (props: PageScreenProps<Extract<Page, { type: K }>>) => ReactNode
  }
}

export const PAGE_TYPE_UI: PageTypeUi = {
  board: { icon: 'board', render: (props) => <BoardScreen {...props} /> },
}

export const renderPage = ({ projectId, page }: PageScreenProps) =>
  (PAGE_TYPE_UI[page.type].render as (props: PageScreenProps) => ReactNode)({ projectId, page })
