import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Icon } from '@components/ui/Icon'
import { colors, fontFamily, fontSize, lineHeight, spacing } from '@styles/theme'

type CheckboxProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  size?: number
  disabled?: boolean
  accessibilityLabel?: string
}

export function Checkbox({ checked, onChange, label, size = 28, disabled, accessibilityLabel }: CheckboxProps) {
  return (
    <Pressable
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      hitSlop={4}
      onPress={() => onChange(!checked)}
      style={[styles.row, label ? styles.rowLabelled : null, disabled && styles.disabled]}
    >
      <View
        style={[
          styles.box,
          { width: size, height: size, borderRadius: size * 0.2 },
          checked ? styles.boxChecked : styles.boxUnchecked,
        ]}
      >
        {checked && <Icon name="check" size={size * 0.6} color={colors.checkbox.activeIcon} strokeWidth={3} />}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  rowLabelled: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  boxUnchecked: {
    borderColor: colors.checkbox.inactiveBorder,
    backgroundColor: colors.checkbox.inactiveBackground,
  },
  boxChecked: {
    borderColor: colors.checkbox.activeBorder,
    backgroundColor: colors.checkbox.activeBackground,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    color: colors.text,
    fontFamily: fontFamily.primary,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
})
