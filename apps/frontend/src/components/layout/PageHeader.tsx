import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

import { Breadcrumbs, type Crumb } from '@components/ui/Breadcrumbs'
import { EditableField } from '@components/ui/EditableField'
import { IconButton } from '@components/ui/IconButton'
import { type IconName } from '@components/ui/Icon'
import { Initial } from '@components/ui/Initial'
import { fontSize, lineHeight, spacing } from '@styles/theme'

type PageHeaderProps = {
  crumbs: Crumb[]
  initial: { label?: string; icon?: IconName; usage: 'project' | 'page' }
  name: string
  nameLabel: string
  onRename: (name: string) => Promise<void>
  onOpenSettings: () => void
  settingsLabel: string
  style?: StyleProp<ViewStyle>
}

export function PageHeader({
  crumbs,
  initial,
  name,
  nameLabel,
  onRename,
  onOpenSettings,
  settingsLabel,
  style,
}: PageHeaderProps) {
  return (
    <View style={style}>
      <View style={styles.breadcrumbs}>
        <Breadcrumbs crumbs={crumbs} />
      </View>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Initial {...initial} variant="primary" />
          <View style={styles.headline}>
            <EditableField
              value={name}
              onSave={onRename}
              background="secondary"
              accessibilityLabel={nameLabel}
              style={styles.headlineText}
            />
          </View>
        </View>
        <IconButton icon="custom" accessibilityLabel={settingsLabel} onPress={onOpenSettings} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  breadcrumbs: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.xl,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  headline: {
    flex: 1,
  },
  headlineText: {
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
  },
})
