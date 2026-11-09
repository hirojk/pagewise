import { useRef, useState, type ComponentRef } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { Button } from '@components/ui/Button'
import { Dropdown, measureAnchor, type Anchor, type DropdownOption } from '@components/ui/Dropdown'
import { colors, fontFamily, fontSize, lineHeight, spacing } from '@styles/theme'

type SectionHeaderProps = {
  title: string
  actionLabel: string
  onAction?: () => void
  actionMenu?: DropdownOption[]
  actionDisabled?: boolean
}

export function SectionHeader({ title, actionLabel, onAction, actionMenu, actionDisabled }: SectionHeaderProps) {
  const buttonRef = useRef<ComponentRef<typeof View>>(null)
  const [menuAnchor, setMenuAnchor] = useState<Anchor | null>(null)

  const handlePress = async () => {
    if (actionMenu) {
      setMenuAnchor(await measureAnchor(buttonRef))
    } else {
      onAction?.()
    }
  }

  return (
    <View style={styles.titleWrapper}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View ref={buttonRef} collapsable={false}>
        <Button
          label={actionLabel}
          variant="link"
          onPress={handlePress}
          disabled={actionDisabled}
          aria-haspopup={actionMenu ? 'menu' : undefined}
        />
      </View>
      {actionMenu && (
        <Dropdown
          anchor={menuAnchor}
          options={actionMenu}
          borderColor="secondary"
          onClose={() => setMenuAnchor(null)}
        />
      )}
    </View>
  )
}

export function EmptyText({ children }: { children: string }) {
  return <Text style={styles.empty}>{children}</Text>
}

const styles = StyleSheet.create({
  titleWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    color: colors.text,
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
  },
  empty: {
    marginTop: spacing.md,
    color: colors.textDisabled,
    fontFamily: fontFamily.primary,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
})
