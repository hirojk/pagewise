import { useEffect } from 'react'
import { Stack } from 'expo-router'

import { useProjectStore } from '@stores/projectStore'
import { colors } from '@styles/theme'

// Everything in (app) needs a logged-in user; the root layout guards it.
export default function AppLayout() {
  const loadProjects = useProjectStore((state) => state.loadProjects)

  useEffect(() => {
    loadProjects().catch((error) => console.error('Error loading projects:', error))
  }, [loadProjects])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  )
}
