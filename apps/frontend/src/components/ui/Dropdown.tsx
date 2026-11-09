import { useRef, useState, type ComponentRef, type RefObject } from 'react'
import { Modal, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native'

import { Icon, type IconName } from '@components/ui/Icon'
import { colors, fontFamily, fontSize, lineHeight } from '@styles/theme'

export type DropdownOption = { name: string; icon?: IconName; iconColor?: string; action: () => void }
export type Anchor = { x: number; y: number; width: number; height: number }

type DropdownProps = {
  anchor: Anchor | null
  description?: string
  options: DropdownOption[]
  onClose: () => void
  borderColor?: 'primary' | 'secondary'
  minWidth?: number
}

const SCREEN_MARGIN = 8
const RUN_AFTER_DISMISS = Platform.OS === 'ios' || Platform.OS === 'web'

export function Dropdown({ anchor, description, options, onClose, borderColor = 'primary', minWidth }: DropdownProps) {
  const { width: screenWidth } = useWindowDimensions()
  const [panelWidth, setPanelWidth] = useState(0)
  const pendingAction = useRef<(() => void) | null>(null)

  const choose = (action: () => void) => {
    if (RUN_AFTER_DISMISS) pendingAction.current = action
    onClose()
    if (!RUN_AFTER_DISMISS) action()
  }

  const runPendingAction = () => {
    const action = pendingAction.current
    pendingAction.current = null
    action?.()
  }

  const left = anchor
    ? Math.min(
        Math.max(anchor.x + anchor.width / 2 - panelWidth / 2, SCREEN_MARGIN),
        screenWidth - panelWidth - SCREEN_MARGIN,
      )
    : 0

  return (
    <Modal
      visible={!!anchor}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
      onDismiss={runPendingAction}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close menu" />
      {anchor && (
        <View
          style={[
            styles.panel,
            {
              top: anchor.y + anchor.height + 15,
              left,
              minWidth,
              opacity: panelWidth ? 1 : 0,
              borderColor: borderColor === 'primary' ? colors.dropdownBorder : colors.dropdownBorderSecondary,
            },
          ]}
          onLayout={(event) => setPanelWidth(event.nativeEvent.layout.width)}
        >
          {description && <Text style={styles.description}>{description}</Text>}
          <View role="menu">
            {options.map((option) => (
              <Pressable
                key={option.name}
                role="menuitem"
                style={({ pressed }) => [styles.action, pressed && styles.pressed]}
                onPress={() => choose(option.action)}
              >
                {option.icon && <Icon name={option.icon} size={20} color={option.iconColor} />}
                <Text style={styles.actionLabel}>{option.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </Modal>
  )
}

export const measureAnchor = (ref: RefObject<ComponentRef<typeof View> | null>) =>
  new Promise<Anchor | null>((resolve) => {
    if (!ref.current) return resolve(null)
    ref.current.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }))
  })

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    gap: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.dropdownBorder,
    borderRadius: 8,
    backgroundColor: colors.surfaceWhite,
    boxShadow: `0 0 16px ${colors.shadow}`,
  },
  description: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    color: colors.text,
    fontFamily: fontFamily.primaryBold,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    textTransform: 'capitalize',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 120,
    maxWidth: 320,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  pressed: {
    opacity: 0.6,
  },
  actionLabel: {
    color: colors.text,
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
})
