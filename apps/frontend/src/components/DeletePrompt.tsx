import { Modal, Pressable, StyleSheet, Text, View } from 'react-native'

import { Button } from '@components/ui/Button'
import { colors, fontFamily, fontSize, lineHeight, spacing } from '@styles/theme'

// A small confirm dialog.
type DeletePromptProps = {
  visible: boolean
  message: string
  onConfirm: () => void
  onCancel: () => void
  isDeleting?: boolean
}

export function DeletePrompt({ visible, message, onConfirm, onCancel, isDeleting }: DeletePromptProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} accessibilityLabel="Cancel" />
        <View style={styles.prompt} role="alertdialog" aria-modal>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.buttonGroup}>
            <Button label="Delete" variant="error" style={styles.button} onPress={onConfirm} disabled={isDeleting} />
            <Button label="Cancel" variant="secondary" style={styles.button} onPress={onCancel} />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  prompt: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: spacing.xl,
    padding: spacing.xl,
    borderRadius: 16,
    backgroundColor: colors.surfaceWhite,
    boxShadow: `0 0 16px ${colors.shadow}`,
  },
  message: {
    maxWidth: 240,
    color: colors.text,
    fontFamily: fontFamily.primary,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    textAlign: 'center',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
  },
  button: {
    minWidth: 128,
  },
})
