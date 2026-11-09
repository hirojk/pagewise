import { useEffect, useState, type ComponentRef, type RefObject } from 'react'
import { Keyboard, Platform, ScrollView, StyleSheet, TextInput, type StyleProp, type TextStyle } from 'react-native'

import { spacing } from '@styles/theme'

/**
 * Current keyboard height on iOS (0 when hidden, and always 0 on Android/web, where the window resizes itself).
 */
export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    if (Platform.OS !== 'ios') return
    const show = Keyboard.addListener('keyboardWillShow', (event) => setKeyboardHeight(event.endCoordinates.height))
    const hide = Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0))
    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  return keyboardHeight
}

/**
 * Keeps the focused text input inside a ScrollView visible above the keyboard (iOS).
 * Returns the extra bottom padding the ScrollView content needs (keyboard height + margin), so it can scroll far enough, and scrolls the focused input into view whenever the keyboard appears.
 */
export const useKeepFocusedInputVisible = (scrollRef: RefObject<ComponentRef<typeof ScrollView> | null>) => {
  const KEYBOARD_MARGIN = spacing.xl

  const keyboardHeight = useKeyboardHeight()

  useEffect(() => {
    if (Platform.OS !== 'ios') return
    const subscription = Keyboard.addListener('keyboardDidShow', () => {
      const input = TextInput.State.currentlyFocusedInput()
      const scrollView = scrollRef.current
      const content = scrollView?.getInnerViewRef()
      if (!input || !scrollView || !content) return
      input.measureLayout(
        content,
        () => {
          scrollView.measureInWindow((_x, scrollViewTop) => {
            scrollView.scrollResponderScrollNativeHandleToKeyboard(input, KEYBOARD_MARGIN + scrollViewTop, true)
          })
        },
        () => {},
      )
    })
    return () => subscription.remove()
  }, [KEYBOARD_MARGIN, scrollRef])

  return keyboardHeight ? keyboardHeight + KEYBOARD_MARGIN : 0
}

/**
 * iOS draws a single-line TextInput's text at the top of its `lineHeight` instead of centring it (unlike CSS on web), which shows up as extra space under the text.
 * So on iOS the line height is dropped and the padding alone sets the height. Multi-line inputs are left alone, because line height works normally there.
 */
export const withoutIosLineHeight = (style: StyleProp<TextStyle>, multiline?: boolean): StyleProp<TextStyle> => {
  if (Platform.OS !== 'ios' || multiline) return style
  const { lineHeight: _ignored, ...rest } = StyleSheet.flatten(style) ?? {}
  return rest
}
