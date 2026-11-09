import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'

import { Icon, type IconName } from '@components/ui/Icon'
import { colors, fontFamily, fontSize, lineHeight } from '@styles/theme'
import { getInitials } from '@utils/helper'

type InitialProps = {
  label?: string
  icon?: IconName
  variant: 'primary' | 'secondary' | 'transparent'
  usage: 'project' | 'page' | 'neutral'
  style?: StyleProp<ViewStyle>
}

export const INITIAL_SIZE = 60
const ICON_SIZE = 40

export function Initial({ label = '', icon, variant, usage, style }: InitialProps) {
  const theme = colors[usage]
  const color = variant === 'secondary' ? theme.colorSecondary : theme.color
  const backgroundColor =
    variant === 'transparent' ? 'transparent' : variant === 'primary' ? theme.background : theme.backgroundSecondary

  return (
    <View style={[styles.initial, { backgroundColor }, style]} aria-hidden>
      {icon ? (
        <Icon name={icon} size={ICON_SIZE} color={color} />
      ) : (
        <Text style={[styles.text, { color }]}>{getInitials(label)}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  initial: {
    width: INITIAL_SIZE,
    height: INITIAL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  text: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
  },
})
