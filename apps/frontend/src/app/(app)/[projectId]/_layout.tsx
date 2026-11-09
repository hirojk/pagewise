import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { Slot, useLocalSearchParams } from 'expo-router'

import { Sidebar } from '@components/sidebar/Sidebar'
import { colors, SIDEBAR_BREAKPOINT } from '@styles/theme'

export default function ProjectLayout() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>()
  const { width } = useWindowDimensions()

  return (
    <View style={styles.row}>
      {width >= SIDEBAR_BREAKPOINT && <Sidebar projectId={Number(projectId)} />}
      <View style={styles.content}>
        <Slot />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
    zIndex: 1000,
    boxShadow: `-16px 0 32px 
    ${colors.shadow}`,
  },
})
