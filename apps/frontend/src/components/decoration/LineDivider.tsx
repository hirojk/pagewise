import { StyleSheet, View, type ViewProps } from 'react-native'

import { colors } from '@styles/theme'

// A notebook line:
// an 8px tall element whose 1px line sits 6px above its top edge.
type LineDividerProps = ViewProps & {
  variant: 'primary' | 'secondary' | 'tertiary'
  /** Hides the line but keeps its space, e.g. for the last tertiary line. */
  hidden?: boolean
}

export function LineDivider({ variant, hidden, style, ...props }: LineDividerProps) {
  return (
    <View style={[styles.divider, style]} aria-hidden pointerEvents="none" {...props}>
      <View style={[styles.line, { backgroundColor: hidden ? 'transparent' : colors.line[variant] }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  divider: {
    width: '100%',
    height: 8,
    overflow: 'visible',
    zIndex: 1000,
  },
  line: {
    position: 'absolute',
    top: -6,
    left: 0,
    right: 0,
    height: 1,
  },
})
