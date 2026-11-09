import { useLocalSearchParams } from 'expo-router'

import { PageScreen } from '@components/layout/PageScreen'
import { EmptyText } from '@components/layout/PageSection'
import { Breadcrumbs } from '@components/ui/Breadcrumbs'
import { renderPage } from '@constants/pageTypes'
import { useProject, useProjectStore } from '@stores/projectStore'

export default function ComponentScreen() {
  const params = useLocalSearchParams<{ projectId: string; componentId: string }>()
  const projectId = Number(params.projectId)
  const project = useProject(projectId)
  const hasProjects = useProjectStore((state) => state.allProjects.length > 0)
  const page = project?.components.find((item) => item.id === Number(params.componentId))

  if (!page) {
    return (
      <PageScreen
        header={
          <Breadcrumbs
            crumbs={[
              { label: 'Home', href: '/' },
              {
                label: project?.name || 'Project',
                href: { pathname: '/[projectId]', params: { projectId: String(projectId) } },
              },
            ]}
          />
        }
      >
        <EmptyText>{hasProjects ? 'Page not found.' : 'Loading…'}</EmptyText>
      </PageScreen>
    )
  }

  return renderPage({ projectId, page })
}
