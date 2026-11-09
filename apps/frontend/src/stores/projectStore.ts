import { create } from 'zustand'
import type { PageTypeKey, ProjectType } from '@pagewise/shared'

import { api, unwrap } from '@services/api'

export type PageDraft = { type: 'page'; projectId: number; pageType: PageTypeKey }
export type Draft = { type: 'project' } | PageDraft

type ProjectState = {
  allProjects: ProjectType[]
  draft: Draft | null
  startDraft: (draft: Draft) => void
  cancelDraft: () => void
  loadProjects: () => Promise<void>
  createNewProject: (name: string) => Promise<ProjectType>
  updateProjectName: (projectId: number, name: string) => Promise<void>
  deleteProject: (projectId: number) => Promise<void>
  reset: () => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  allProjects: [],
  draft: null,

  startDraft(draft) {
    set({ draft })
  },

  cancelDraft() {
    set({ draft: null })
  },

  async loadProjects() {
    const { projects } = await unwrap<{ projects: ProjectType[] }>(api.get('/api/v1/projects/user'))
    set({ allProjects: projects })
  },

  async createNewProject(name) {
    const project = await unwrap<ProjectType>(api.post('/api/v1/projects/', { name }))
    set((state) => ({ allProjects: [...state.allProjects, project], draft: null }))
    return project
  },

  async updateProjectName(projectId, name) {
    await api.put(`/api/v1/projects/${projectId}`, { name })
    set((state) => ({
      allProjects: state.allProjects.map((project) => (project.id === projectId ? { ...project, name } : project)),
    }))
  },

  async deleteProject(projectId) {
    await api.delete(`/api/v1/projects/${projectId}`)
    set((state) => ({ allProjects: state.allProjects.filter((project) => project.id !== projectId) }))
  },

  reset() {
    set({ allProjects: [], draft: null })
  },
}))

export const useIsDraftingProject = (): boolean => useProjectStore((state) => state.draft?.type === 'project')

export const usePageDraft = (projectId: number): PageDraft | null =>
  useProjectStore((state) => (state.draft?.type === 'page' && state.draft.projectId === projectId ? state.draft : null))

export const useProject = (projectId: number): ProjectType | undefined =>
  useProjectStore((state) => state.allProjects.find((project) => project.id === projectId))
