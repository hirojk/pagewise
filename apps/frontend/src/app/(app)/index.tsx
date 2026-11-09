import { useRef, useState, type ComponentRef } from 'react'
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native'

import { DraftPageItem, PageItem } from '@components/PageItem'
import { ItemGrid } from '@components/layout/ItemGrid'
import { PageScreen } from '@components/layout/PageScreen'
import { EmptyText, SectionHeader } from '@components/layout/PageSection'
import { Avatar } from '@components/ui/Avatar'
import { Dropdown, measureAnchor, type Anchor } from '@components/ui/Dropdown'
import { useAuthStore } from '@stores/authStore'
import { useIsDraftingProject, useProjectStore } from '@stores/projectStore'
import { colors, fontFamily, fontSize, lineHeight, NARROW_BREAKPOINT, spacing } from '@styles/theme'

const openerTexts = [
  'Good to have you here. Ready to pick up where you left off?',
  "Welcome back! Let's keep the momentum going.",
  "Nice to see you again. What's next on your list?",
  'Ready to make some progress today?',
  'Welcome! Time to bring your ideas to life.',
]

export default function HomeScreen() {
  const isNarrow = useWindowDimensions().width < NARROW_BREAKPOINT
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const projects = useProjectStore((state) => state.allProjects)
  const createNewProject = useProjectStore((state) => state.createNewProject)
  const resetProjects = useProjectStore((state) => state.reset)
  const startDraft = useProjectStore((state) => state.startDraft)
  const cancelDraft = useProjectStore((state) => state.cancelDraft)
  const isDrafting = useIsDraftingProject()
  const [opener] = useState(() => openerTexts[Math.floor(Math.random() * openerTexts.length)])
  const [menuAnchor, setMenuAnchor] = useState<Anchor | null>(null)
  const avatarRef = useRef<ComponentRef<typeof View>>(null)

  const handleLogout = async () => {
    await logout().catch((error) => console.error('Logout error:', error))
    resetProjects()
  }

  return (
    <PageScreen
      headerDivider
      header={
        <View style={styles.header}>
          <View style={styles.topbar}>
            <Text style={[styles.headline, isNarrow && styles.headlineNarrow]} accessibilityRole="header">
              Hello {user?.name},
            </Text>
            <Avatar ref={avatarRef} onPress={async () => setMenuAnchor(await measureAnchor(avatarRef))} />
          </View>
          <Text style={styles.subline}>{opener}</Text>
        </View>
      }
      overlay={
        <Dropdown
          anchor={menuAnchor}
          description={user?.name}
          options={[{ name: 'Logout', action: handleLogout }]}
          onClose={() => setMenuAnchor(null)}
        />
      }
    >
      <SectionHeader
        title="Your Projects"
        actionLabel="Create New Project"
        onAction={() => startDraft({ type: 'project' })}
        actionDisabled={isDrafting}
      />
      <ItemGrid
        empty={<EmptyText>No projects found. Click &quot;Create New Project&quot; to get started 🙂</EmptyText>}
        items={projects}
        keyExtractor={(project) => project.id}
        renderItem={(project) => (
          <PageItem
            usage="project"
            label={project.name}
            href={{ pathname: '/[projectId]', params: { projectId: String(project.id) } }}
          />
        )}
        draft={
          isDrafting && (
            <DraftPageItem usage="project" onConfirm={(name) => createNewProject(name)} onCancel={cancelDraft} />
          )
        }
      />
    </PageScreen>
  )
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  topbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    width: '100%',
  },
  headline: {
    flexShrink: 1,
    color: colors.textSecondary,
    fontFamily: fontFamily.primaryBold,
    fontSize: fontSize.display,
    lineHeight: lineHeight.display,
    textTransform: 'uppercase',
  },
  headlineNarrow: {
    fontSize: fontSize.xxl,
    lineHeight: spacing.lg,
  },
  subline: {
    color: colors.text,
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
  },
})
