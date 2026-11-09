import { useState } from 'react'
import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'
import { Link, type Href } from 'expo-router'

type PressableLinkProps = Omit<PressableProps, 'style'> & {
  href: Href
  style?: StyleProp<ViewStyle>
  pressedStyle?: StyleProp<ViewStyle>
}

/**
 * A Pressable that navigates like expo-router's <Link>.
 *
 * `<Link asChild>` merges its child's style with `{ ...linkStyle, ...childStyle }`
 * (Radix Slot), so a Pressable style *function* or style *array* is silently lost.
 * Here the style is always one flat object, and the pressed state is tracked with
 * onPressIn/onPressOut (event handlers are merged correctly).
 */
export function PressableLink({ href, style, pressedStyle, onPressIn, onPressOut, ...props }: PressableLinkProps) {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="link"
        style={StyleSheet.flatten([style, isPressed && pressedStyle])}
        onPressIn={(event) => {
          setIsPressed(true)
          onPressIn?.(event)
        }}
        onPressOut={(event) => {
          setIsPressed(false)
          onPressOut?.(event)
        }}
        {...props}
      />
    </Link>
  )
}
