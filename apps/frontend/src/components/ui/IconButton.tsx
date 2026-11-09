import { useRef, useState, type ComponentRef } from 'react'
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native'

import { Dropdown, measureAnchor, type Anchor, type DropdownOption } from '@components/ui/Dropdown'
import { Icon, type IconName } from '@components/ui/Icon'
import { colors } from '@styles/theme'

type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: IconName
  accessibilityLabel: string
  size?: number
  borderColor?: 'primary' | 'secondary' | 'tertiary'
  dropdown?: DropdownOption[]
}

const borderColors = { primary: colors.brandPrimary, secondary: colors.border, tertiary: 'transparent' }

export function IconButton({ icon, size = 42, borderColor = 'primary', dropdown, onPress, ...props }: IconButtonProps) {
  const ref = useRef<ComponentRef<typeof View>>(null)
  const [anchor, setAnchor] = useState<Anchor | null>(null)

  return (
    <>
      <Pressable
        ref={ref}
        accessibilityRole="button"
        aria-haspopup={dropdown ? 'menu' : undefined}
        hitSlop={4}
        style={({ pressed }) => [styles.button, { borderColor: borderColors[borderColor] }, pressed && styles.pressed]}
        onPress={async (event) => {
          onPress?.(event)
          if (dropdown) setAnchor(await measureAnchor(ref))
        }}
        {...props}
      >
        <Icon name={icon} size={size} />
      </Pressable>
      {dropdown && (
        <Dropdown anchor={anchor} options={dropdown} borderColor="secondary" onClose={() => setAnchor(null)} />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.7,
  },
})
