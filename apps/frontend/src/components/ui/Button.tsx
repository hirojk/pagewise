import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native'

import { Icon, type IconName } from '@components/ui/Icon'
import { colors, fontFamily, fontSize, lineHeight } from '@styles/theme'

type ButtonProps = Omit<PressableProps, 'children'> & {
  label: string
  variant?: 'primary' | 'secondary' | 'error' | 'board' | 'link'
  size?: 'large' | 'small'
  icon?: IconName
}

export function Button({ label, variant = 'primary', size = 'large', icon, style, ...props }: ButtonProps) {
  const iconSize = size === 'small' ? 16 : 20
  const iconColor = StyleSheet.flatten(labelColor[variant])?.color as string | undefined

  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={variant === 'link' ? 8 : undefined}
      style={(state) => [
        styles.base,
        variant !== 'link' && styles[size],
        styles[variant],
        icon && styles.withIcon,
        state.pressed && styles.pressed,
        props.disabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      {icon && <Icon name={icon} size={iconSize} color={iconColor} />}
      <Text style={[styles.label, size === 'small' ? styles.labelSmall : styles.labelLarge, labelColor[variant]]}>
        {label}
      </Text>
      {icon && (
        <View style={styles.ghostIcon}>
          <Icon name={icon} size={iconSize} color={iconColor} />
        </View>
      )}
      {variant === 'link' && <View style={styles.underline} />}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.brandSecondary,
    borderColor: colors.brandSecondary,
  },
  secondary: {
    backgroundColor: colors.surfaceWhite,
    borderColor: colors.brandSecondary,
  },
  error: {
    backgroundColor: colors.surfaceWhite,
    borderColor: colors.error,
  },
  board: {
    backgroundColor: colors.button.board.background,
    borderColor: colors.button.board.border,
  },
  withIcon: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  ghostIcon: {
    opacity: 0,
  },
  link: {
    position: 'relative',
  },
  underline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -4,
    height: 2,
    backgroundColor: colors.brandPrimary,
  },
  large: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  small: {
    borderWidth: 1.5,
    borderRadius: 9,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: fontFamily.secondary,
    textAlign: 'center',
  },
  labelLarge: {
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
  labelSmall: {
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
})

const labelColor = StyleSheet.create({
  primary: {
    color: colors.textNegative,
  },
  secondary: {
    color: colors.text,
  },
  error: {
    color: colors.error,
  },
  board: {
    color: colors.button.board.color,
  },
  link: {
    color: colors.text,
  },
})
