import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { LineDivider } from '@components/decoration/LineDivider'
import { useDecorationLines } from '@hooks/useDecorationLines'
import { colors, NARROW_BREAKPOINT, spacing } from '@styles/theme'

type PageScreenProps = {
  header: ReactNode
  headerDivider?: boolean
  overlay?: ReactNode
  children: ReactNode
}

export function PageScreen({ header, headerDivider, overlay, children }: PageScreenProps) {
  const insets = useSafeAreaInsets()
  const isNarrow = useWindowDimensions().width < NARROW_BREAKPOINT
  const { lineCount, onViewportLayout, onContentLayout } = useDecorationLines()

  return (
    <View
      style={[
        styles.page,
        {
          paddingTop: insets.top + spacing.pageY,
          paddingBottom: insets.bottom + spacing.pageY * 2,
          paddingHorizontal: isNarrow ? spacing.lg : spacing.pageX,
        },
      ]}
    >
      {header}

      {headerDivider && <LineDivider variant="secondary" />}

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner} onLayout={onViewportLayout}>
        <View style={styles.category} onLayout={onContentLayout}>
          {children}
        </View>
        {Array.from({ length: lineCount }, (_, index) => (
          <LineDivider key={index} variant="tertiary" hidden={index === lineCount - 1} />
        ))}
      </ScrollView>

      <LineDivider variant="primary" style={[styles.footer, { bottom: insets.bottom + spacing.pageY * 1.5 }]} />

      {overlay}
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    gap: spacing.xl,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    overflow: 'visible',
  },
  contentInner: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  category: {
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  footer: {
    position: 'absolute',
    width: 'auto',
    left: 0,
    right: 0,
  },
})
