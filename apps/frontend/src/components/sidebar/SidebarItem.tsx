import { Pressable, StyleSheet, Text, View } from 'react-native'
import { type Href } from 'expo-router'

import { type IconName } from '@components/ui/Icon'
import { Initial } from '@components/ui/Initial'
import { PressableLink } from '@components/ui/PressableLink'
import { colors, fontFamily, fontSize, lineHeight } from '@styles/theme'

export const SIDEBAR_ITEM_SIZE = 100

type SidebarItemProps = {
  usage: 'project' | 'page' | 'neutral'
  label: string
  subline?: string
  icon?: IconName
  href?: Href
  onPress?: () => void
  index: number
  backgroundSpan?: number
  isStackEnd?: boolean
}

export function SidebarItem({
  usage,
  label,
  subline,
  icon,
  href,
  onPress,
  index,
  backgroundSpan = 1,
  isStackEnd,
}: SidebarItemProps) {
  const theme = colors[usage]
  const shadowColor = isStackEnd ? colors.sidebar.stackShadow : theme.shadow

  const content = (
    <>
      <View
        style={[
          styles.background,
          { height: SIDEBAR_ITEM_SIZE * backgroundSpan, boxShadow: `0 8px 32px 4px ${shadowColor}4D` },
          usage === 'page' && !isStackEnd && styles.backgroundPage,
        ]}
      />
      <View
        style={[
          styles.background,
          {
            height: SIDEBAR_ITEM_SIZE * backgroundSpan,
            backgroundColor: theme.background,
            backgroundImage:
              usage === 'neutral'
                ? undefined
                : `linear-gradient(90deg, ${theme.background}, ${theme.backgroundSecondary})`,
          },
          usage === 'page' && styles.backgroundPage,
        ]}
      />
      <View style={styles.icon}>
        <Initial label={label} icon={icon} variant="transparent" usage={usage} />
      </View>
      <View style={styles.content}>
        <View style={styles.headlineWrapper}>
          <Text style={[styles.headline, { color: theme.color }]} numberOfLines={1}>
            {label}
          </Text>
          {usage === 'neutral' && <View style={styles.underline} />}
        </View>
        {subline ? (
          <Text style={[styles.subline, { color: theme.colorSecondary }]} numberOfLines={1}>
            {subline}
          </Text>
        ) : null}
      </View>
    </>
  )

  const itemStyle = [styles.item, { zIndex: 100 - index }]

  if (href) {
    return (
      <PressableLink href={href} onPress={onPress} style={itemStyle}>
        {content}
      </PressableLink>
    )
  }

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={itemStyle}>
      {content}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    height: SIDEBAR_ITEM_SIZE,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  backgroundPage: {
    borderBottomLeftRadius: 24,
  },
  icon: {
    width: SIDEBAR_ITEM_SIZE,
    height: SIDEBAR_ITEM_SIZE,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    overflow: 'hidden',
  },
  headlineWrapper: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  headline: {
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
  underline: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -4,
    height: 2,
    backgroundColor: colors.brandPrimary,
  },
  subline: {
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
})
