import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { Button } from '@components/ui/Button'
import { colors, fontFamily, fontSize, lineHeight, spacing } from '@styles/theme'

export function ModalHeadline({ children }: { children: string }) {
  return (
    <Text style={styles.headline} accessibilityRole="header">
      {children}
    </Text>
  )
}

export function ModalCategory({ title, children, danger }: { title: string; children: ReactNode; danger?: boolean }) {
  return (
    <View style={styles.category}>
      <Text style={[styles.categoryHeadline, danger && styles.danger]} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  )
}

export function ModalText({ title, text, danger }: { title: string; text: string; danger?: boolean }) {
  return (
    <View style={styles.textWrapper}>
      <Text style={[styles.copy, styles.copyStrong, danger && styles.danger]}>{title}</Text>
      <Text style={[styles.copy, danger && styles.danger]}>{text}</Text>
    </View>
  )
}

export function DangerZone({
  title,
  text,
  buttonLabel,
  onPress,
  children,
}: {
  title: string
  text: string
  buttonLabel: string
  onPress: () => void
  children?: ReactNode
}) {
  return (
    <View style={styles.dangerZone}>
      <ModalCategory title="Danger Zone" danger>
        <View style={styles.dangerZoneContent}>
          <ModalText title={title} text={text} danger />
          <Button label={buttonLabel} variant="error" onPress={onPress} />
        </View>
      </ModalCategory>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  headline: {
    color: colors.textSecondary,
    fontFamily: fontFamily.primaryBold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    textTransform: 'uppercase',
  },
  category: {
    gap: spacing.lg,
  },
  categoryHeadline: {
    color: colors.text,
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
  },
  danger: {
    color: colors.error,
  },
  textWrapper: {
    flexShrink: 1,
  },
  copy: {
    color: colors.text,
    fontFamily: fontFamily.primary,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
  copyStrong: {
    fontFamily: fontFamily.primaryBold,
  },
  dangerZone: {
    padding: spacing.xs,
  },
  dangerZoneContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.xl,
  },
})
