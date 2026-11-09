import { create } from 'zustand'
import { PAGE_TYPES, type ComponentType, type PageTypeKey, type ProjectType } from '@pagewise/shared'

import { api, unwrap } from '@services/api'
import { useProjectStore } from '@stores/projectStore'

// Operations every page type shares (a page = one entry in a project's `components`).
// Only the URL segment differs per type (PAGE_TYPES[type].apiPath). Type-specific data
// (a board's columns and cards, …) lives in its own store, e.g. boardStore.
type PageState = {
  createPage: (projectId: number, type: PageTypeKey, name: string) => Promise<ComponentType>
  renamePage: (projectId: number, page: ComponentType, name: string) => Promise<void>
  deletePage: (projectId: number, page: ComponentType) => Promise<void>
}

const pageUrl = (projectId: number, type: PageTypeKey, pageId?: number) =>
  `/api/v1/projects/${projectId}/${PAGE_TYPES[type].apiPath}${pageId === undefined ? '' : `/${pageId}`}`

const updatePages = (
  projectId: number,
  change: (pages: ComponentType[]) => ComponentType[],
  extra: Partial<ReturnType<typeof useProjectStore.getState>> = {},
) =>
  useProjectStore.setState((state) => ({
    ...extra,
    allProjects: state.allProjects.map(
      (project): ProjectType =>
        project.id === projectId ? { ...project, components: change(project.components) } : project,
    ),
  }))

export const replacePage = (projectId: number, page: ComponentType) =>
  updatePages(projectId, (pages) => pages.map((item) => (item.id === page.id ? page : item)))

export const findPage = (projectId: number, pageId: number) =>
  useProjectStore
    .getState()
    .allProjects.find((project) => project.id === projectId)
    ?.components.find((page) => page.id === pageId)

export const usePageStore = create<PageState>(() => ({
  async createPage(projectId, type, name) {
    const page = await unwrap<ComponentType>(api.post(pageUrl(projectId, type), { name }))
    updatePages(projectId, (pages) => [...pages, page], { draft: null })
    return page
  },

  async renamePage(projectId, page, name) {
    await api.put(pageUrl(projectId, page.type, page.id), { name })
    updatePages(projectId, (pages) => pages.map((item) => (item.id === page.id ? { ...item, name } : item)))
  },

  async deletePage(projectId, page) {
    await api.delete(pageUrl(projectId, page.type, page.id))
    updatePages(projectId, (pages) => pages.filter((item) => item.id !== page.id))
  },
}))
