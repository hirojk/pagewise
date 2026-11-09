import { useRef, useState, type ComponentRef } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Dropdown, measureAnchor, type Anchor, type DropdownOption } from '@components/ui/Dropdown'
import { Icon, type IconName } from '@components/ui/Icon'
import { colors, fontFamily, fontSize, lineHeight, spacing } from '@styles/theme'

type SelectMenuProps = {
  label: string
  icon?: IconName
  options: DropdownOption[]
  accessibilityLabel?: string
}

export function SelectMenu({ label, icon, options, accessibilityLabel }: SelectMenuProps) {
  const ref = useRef<ComponentRef<typeof View>>(null)
  const [anchor, setAnchor] = useState<Anchor | null>(null)
  const isOpen = !!anchor

  return (
    <>
      <Pressable
        ref={ref}
        accessibilityRole="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        accessibilityLabel={accessibilityLabel ?? label}
        onPress={async () => setAnchor(await measureAnchor(ref))}
        style={styles.menu}
      >
        {icon && <Icon name={icon} size={22} />}
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        <View style={styles.arrow}>
          <Icon name="dropdownOpen" size={22} />
        </View>
        <View pointerEvents="none" style={[styles.border, { borderWidth: isOpen ? BORDER_OPEN : BORDER_CLOSED }]} />
      </Pressable>
      <Dropdown
        anchor={anchor}
        options={options}
        borderColor="secondary"
        minWidth={anchor?.width}
        onClose={() => setAnchor(null)}
      />
    </>
  )
}

const ARROW_WIDTH = 32
const BORDER_CLOSED = 1.5
const BORDER_OPEN = 1
const RADIUS = 12

const styles = StyleSheet.create({
  menu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
    paddingRight: ARROW_WIDTH + spacing.sm,
    borderRadius: RADIUS,
    backgroundColor: colors.selectMenu.background,
    overflow: 'hidden',
  },
  border: {
    ...StyleSheet.absoluteFill,
    borderRadius: RADIUS,
    borderColor: colors.selectMenu.border,
  },
  label: {
    minWidth: 90,
    color: colors.text,
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
  arrow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: ARROW_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.selectMenu.surface,
  },
})
