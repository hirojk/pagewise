import { Fragment } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { router, type Href } from 'expo-router'

import { Button } from '@components/ui/Button'
import { colors, fontFamily, fontSize, lineHeight, spacing } from '@styles/theme'

export type Crumb = { label: string; href: Href }

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <View style={styles.list} role="navigation" aria-label="Breadcrumb">
      {crumbs.map((crumb, index) => {
        const isCurrent = index === crumbs.length - 1
        return (
          <Fragment key={index}>
            {isCurrent ? (
              <Text style={styles.current} numberOfLines={1} aria-current="page">
                {crumb.label}
              </Text>
            ) : (
              <Button label={crumb.label} variant="link" onPress={() => router.navigate(crumb.href)} />
            )}
            {!isCurrent && <Text style={styles.separator}>/</Text>}
          </Fragment>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  current: {
    flexShrink: 1,
    color: colors.text,
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
  separator: {
    color: colors.text,
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
})
