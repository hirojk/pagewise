import { useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react'
import {
  Animated,
  Keyboard,
  Modal as RNModal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native'

import { IconButton } from '@components/ui/IconButton'
import { useKeepFocusedInputVisible } from '@hooks/useIosInteractions'
import { colors, NARROW_BREAKPOINT, spacing } from '@styles/theme'

type ModalProps = {
  visible: boolean
  onClose: () => void
  header?: ReactNode
  footer?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}

const FADE_IN_DURATION = 150

export function Modal({ visible, onClose, header, footer, actions, children }: ModalProps) {
  const isNarrow = useWindowDimensions().width < NARROW_BREAKPOINT
  const [opacity] = useState(() => new Animated.Value(0))
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null)
  const keyboardPadding = useKeepFocusedInputVisible(scrollRef)

  const close = () => {
    Keyboard.dismiss()
    onClose()
  }

  useEffect(() => {
    if (!visible) return
    opacity.setValue(0)
    Animated.timing(opacity, {
      toValue: 1,
      duration: FADE_IN_DURATION,
      useNativeDriver: Platform.OS !== 'web',
    }).start()
  }, [visible, opacity])

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={close}
    >
      <Animated.View style={[styles.backdrop, { opacity, padding: isNarrow ? spacing.md : spacing.pageY }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close dialog" />
        <View style={[styles.panel, { padding: isNarrow ? spacing.md : spacing.xl }]} role="dialog" aria-modal>
          <View style={styles.navigation}>
            <IconButton icon="cancel" borderColor="secondary" accessibilityLabel="Close" onPress={close} />
            {actions}
          </View>
          {header ? <View style={styles.header}>{header}</View> : null}
          <ScrollView
            ref={scrollRef}
            style={styles.scroll}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: spacing.xs + keyboardPadding }]}
          >
            {children}
          </ScrollView>
          {footer}
        </View>
      </Animated.View>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.shadow,
  },
  panel: {
    width: '100%',
    height: '100%',
    maxWidth: 900,
    maxHeight: 900,
    borderRadius: 16,
    backgroundColor: colors.surfaceWhite,
    boxShadow: `0 0 40px 16px ${colors.shadow}`,
    overflow: 'hidden',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    padding: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginBottom: spacing.xl,
    padding: spacing.xs,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: spacing.xxl,
    padding: spacing.xs,
  },
})
