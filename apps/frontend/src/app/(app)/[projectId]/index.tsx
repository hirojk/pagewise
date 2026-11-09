import { useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import { PAGE_TYPES, type PageTypeKey } from '@pagewise/shared'

import { DeletePrompt } from '@components/DeletePrompt'
import { DraftPageItem, PageItem } from '@components/PageItem'
import { ItemGrid } from '@components/layout/ItemGrid'
import { DangerZone, ModalHeadline } from '@components/layout/ModalSection'
import { PageHeader } from '@components/layout/PageHeader'
import { PageScreen } from '@components/layout/PageScreen'
import { EmptyText, SectionHeader } from '@components/layout/PageSection'
import { Breadcrumbs } from '@components/ui/Breadcrumbs'
import { Modal } from '@components/ui/Modal'
import { PAGE_TYPE_UI } from '@constants/pageTypes'
import { usePageStore } from '@stores/pageStore'
import { usePageDraft, useProject, useProjectStore } from '@stores/projectStore'
import { colors } from '@styles/theme'

export default function ProjectScreen() {
  const { projectId: projectIdParam } = useLocalSearchParams<{ projectId: string }>()
  const projectId = Number(projectIdParam)
  const project = useProject(projectId)
  const hasProjects = useProjectStore((state) => state.allProjects.length > 0)
  const updateProjectName = useProjectStore((state) => state.updateProjectName)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const createPage = usePageStore((state) => state.createPage)

  const startDraft = useProjectStore((state) => state.startDraft)
  const cancelDraft = useProjectStore((state) => state.cancelDraft)
  const pageDraft = usePageDraft(projectId)

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isDeletePromptOpen, setIsDeletePromptOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!project) {
    return (
      <PageScreen
        header={
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              { label: 'Project', href: '/' },
            ]}
          />
        }
      >
        <EmptyText>{hasProjects ? 'Project not found.' : 'Loading…'}</EmptyText>
      </PageScreen>
    )
  }

  const handleDeleteProject = async () => {
    setIsDeleting(true)
    try {
      await deleteProject(projectId)
      setIsDeletePromptOpen(false)
      setIsSettingsOpen(false)
      router.replace('/')
    } catch (error) {
      console.error('Error deleting project:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const pageTypeOptions = (Object.keys(PAGE_TYPES) as PageTypeKey[]).map((pageType) => ({
    name: PAGE_TYPES[pageType].label,
    icon: PAGE_TYPE_UI[pageType].icon,
    iconColor: colors.brandPrimary,
    action: () => startDraft({ type: 'page', projectId, pageType }),
  }))

  return (
    <PageScreen
      header={
        <PageHeader
          crumbs={[
            { label: 'Home', href: '/' },
            {
              label: project.name || 'Project',
              href: { pathname: '/[projectId]', params: { projectId: String(projectId) } },
            },
          ]}
          initial={{ label: project.name, usage: 'project' }}
          name={project.name}
          nameLabel="Project name"
          onRename={(name) => updateProjectName(projectId, name)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          settingsLabel="Project settings"
        />
      }
      overlay={
        <Modal
          visible={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          header={<ModalHeadline>Project Setting</ModalHeadline>}
          footer={
            <DangerZone
              title="Delete project"
              text={'Once you delete a project, there is no going back.\nPlease be certain.'}
              buttonLabel="Delete project"
              onPress={() => setIsDeletePromptOpen(true)}
            >
              <DeletePrompt
                visible={isDeletePromptOpen}
                message={`Are you sure you want to delete the project "${project.name}" ?`}
                isDeleting={isDeleting}
                onConfirm={handleDeleteProject}
                onCancel={() => setIsDeletePromptOpen(false)}
              />
            </DangerZone>
          }
        />
      }
    >
      <SectionHeader
        title="Pages"
        actionLabel="Create New Page"
        actionMenu={pageTypeOptions}
        actionDisabled={!!pageDraft}
      />
      <ItemGrid
        empty={<EmptyText>No pages yet. Click &quot;Create New Page&quot; to get started 🙂</EmptyText>}
        items={project.components}
        keyExtractor={(page) => page.id}
        renderItem={(page) => (
          <PageItem
            usage="page"
            icon={PAGE_TYPE_UI[page.type].icon}
            label={page.name}
            subline={page.type}
            href={{
              pathname: '/[projectId]/[componentId]',
              params: { projectId: String(projectId), componentId: String(page.id) },
            }}
          />
        )}
        draft={
          pageDraft && (
            <DraftPageItem
              usage="page"
              icon={PAGE_TYPE_UI[pageDraft.pageType].icon}
              onConfirm={(name) => createPage(projectId, pageDraft.pageType, name)}
              onCancel={cancelDraft}
            />
          )
        }
      />
    </PageScreen>
  )
}
