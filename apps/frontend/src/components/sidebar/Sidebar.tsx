import { useEffect, useState } from 'react'
import { Animated, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { SIDEBAR_ITEM_SIZE, SidebarItem } from '@components/sidebar/SidebarItem'
import { PAGE_TYPE_UI } from '@constants/pageTypes'
import { useAppStore } from '@stores/appStore'
import { useProject } from '@stores/projectStore'
import { colors } from '@styles/theme'

const SIDEBAR_WIDTH = 275
const SIDEBAR_MINI_WIDTH = SIDEBAR_ITEM_SIZE

export function Sidebar({ projectId }: { projectId: number }) {
  const insets = useSafeAreaInsets()
  const project = useProject(projectId)
  const isOpen = useAppStore((state) => state.isSidebarOpen)
  const setSidebarOpen = useAppStore((state) => state.setSidebarOpen)
  const toggleSidebar = useAppStore((state) => state.toggleSidebar)
  const [width] = useState(() => new Animated.Value(isOpen ? SIDEBAR_WIDTH : SIDEBAR_MINI_WIDTH))

  useEffect(() => {
    Animated.timing(width, {
      toValue: isOpen ? SIDEBAR_WIDTH : SIDEBAR_MINI_WIDTH,
      duration: 200,
      useNativeDriver: false,
    }).start()
  }, [isOpen, width])

  const components = project?.components ?? []
  const close = () => setSidebarOpen(false)

  return (
    <Animated.View style={[styles.sidebar, { width, paddingTop: insets.top }]}>
      <ScrollView style={styles.projectList} showsVerticalScrollIndicator={false}>
        <SidebarItem
          usage="project"
          index={0}
          label={project?.name ?? ''}
          href={{ pathname: '/[projectId]', params: { projectId: String(projectId) } }}
          onPress={close}
          isStackEnd={components.length === 0}
        />
        {components.map((component, index) => (
          <SidebarItem
            key={component.id}
            usage="page"
            index={index + 1}
            icon={PAGE_TYPE_UI[component.type].icon}
            label={component.name}
            subline={component.type}
            href={{
              pathname: '/[projectId]/[componentId]',
              params: { projectId: String(projectId), componentId: String(component.id) },
            }}
            onPress={close}
            backgroundSpan={index + 1}
            isStackEnd={index === components.length - 1}
          />
        ))}
      </ScrollView>

      <View>
        <SidebarItem
          usage="neutral"
          index={0}
          icon="home"
          label="Back to Overview"
          href="/"
          onPress={close}
          isStackEnd
        />
        <SidebarItem
          usage="neutral"
          index={1}
          icon={isOpen ? 'collapse' : 'expand'}
          label={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
          onPress={toggleSidebar}
          isStackEnd
        />
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  sidebar: {
    flexShrink: 0,
    justifyContent: 'space-between',
    backgroundColor: colors.sidebar.background,
    boxShadow: `inset -32px 0 80px ${colors.shadow}`,
    overflow: 'hidden',
  },
  projectList: {
    flexGrow: 0,
  },
})
