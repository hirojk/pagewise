import { StyleSheet, View } from 'react-native'
import type { BoardSettingType } from '@pagewise/shared'

import { DeletePrompt } from '@components/DeletePrompt'
import { DangerZone, ModalCategory, ModalHeadline, ModalText } from '@components/layout/ModalSection'
import { Checkbox } from '@components/ui/Checkbox'
import { Modal } from '@components/ui/Modal'
import { spacing } from '@styles/theme'
import type { SettingKey } from '@utils/board'

const SETTING_KEYS: SettingKey[] = ['priority', 'description', 'checklist']

type BoardSettingModalProps = {
  visible: boolean
  boardName: string
  settings: BoardSettingType
  onClose: () => void
  onChange: (section: keyof BoardSettingType, key: SettingKey, value: boolean) => void
  isDeletePromptOpen: boolean
  isDeleting: boolean
  onRequestDelete: () => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
}

export function BoardSettingModal({
  visible,
  boardName,
  settings,
  onClose,
  onChange,
  isDeletePromptOpen,
  isDeleting,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
}: BoardSettingModalProps) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      header={<ModalHeadline>Board Custom Setting</ModalHeadline>}
      footer={
        <DangerZone
          title="Delete board"
          text={'Once you delete a board, there is no going back.\nPlease be certain.'}
          buttonLabel="Delete board"
          onPress={onRequestDelete}
        >
          <DeletePrompt
            visible={isDeletePromptOpen}
            message={`Are you sure you want to delete the board "${boardName}"?`}
            isDeleting={isDeleting}
            onConfirm={onConfirmDelete}
            onCancel={onCancelDelete}
          />
        </DangerZone>
      }
    >
      <ModalCategory title="Customization">
        <View style={styles.grid}>
          <View style={styles.block}>
            <ModalText
              title="Board Display Settings"
              text="Choose which elements should be visible and marked as important in your board."
            />
            <View style={styles.checkboxes}>
              {SETTING_KEYS.map((key) => (
                <Checkbox
                  key={key}
                  label={`Enable ${key}`}
                  checked={settings.modal[key]}
                  onChange={(value) => onChange('modal', key, value)}
                />
              ))}
            </View>
          </View>
          <View style={styles.block}>
            <ModalText
              title="Card Display Options"
              text="Choose which details appear on each card and highlight what matters most."
            />
            <View style={styles.checkboxes}>
              {SETTING_KEYS.map((key) => (
                <Checkbox
                  key={key}
                  label={`Show ${key}`}
                  checked={settings.cards[key]}
                  disabled={!settings.modal[key]}
                  onChange={(value) => onChange('cards', key, value)}
                />
              ))}
            </View>
          </View>
        </View>
      </ModalCategory>
    </Modal>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
  },
  block: {
    flexGrow: 1,
    flexBasis: 300,
    gap: spacing.md,
  },
  checkboxes: {
    gap: spacing.xs,
  },
})
