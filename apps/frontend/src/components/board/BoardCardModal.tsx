import { StyleSheet, Text, View } from 'react-native'
import type { BoardCardType, BoardSettingType } from '@pagewise/shared'

import { Button } from '@components/ui/Button'
import { Checklist, newChecklistItem } from '@components/ui/Checklist'
import { EditableField } from '@components/ui/EditableField'
import { IconButton } from '@components/ui/IconButton'
import { Modal } from '@components/ui/Modal'
import { SelectMenu } from '@components/ui/SelectMenu'
import { getPriorityIcon, PRIORITY_LIST } from '@constants/priority'
import { colors, fontFamily, fontSize, lineHeight, spacing } from '@styles/theme'

type BoardCardModalProps = {
  visible: boolean
  card: BoardCardType | undefined
  settings: BoardSettingType['modal']
  onClose: () => void
  onUpdate: (updates: Partial<BoardCardType>) => void
  onRemove: () => void
}

export function BoardCardModal({ visible, card, settings, onClose, onUpdate, onRemove }: BoardCardModalProps) {
  if (!card) {
    return (
      <Modal visible={visible} onClose={onClose}>
        <Text style={styles.text}>Card not found</Text>
      </Modal>
    )
  }

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      actions={
        <IconButton
          icon="menu"
          borderColor="secondary"
          accessibilityLabel="Card options"
          dropdown={[{ name: 'Remove Card', action: onRemove }]}
        />
      }
      header={
        <>
          <View style={styles.name}>
            <EditableField
              value={card.name}
              onSave={(name) => onUpdate({ name })}
              underlineColor="secondary"
              accessibilityLabel="Card name"
              style={styles.nameText}
            />
          </View>
          {settings.priority && (
            <SelectMenu
              label={card.priority}
              icon={getPriorityIcon(card.priority)}
              accessibilityLabel={`Priority: ${card.priority}`}
              options={PRIORITY_LIST.map((priority) => ({
                name: priority.name,
                icon: priority.icon,
                action: () => onUpdate({ priority: priority.name }),
              }))}
            />
          )}
        </>
      }
    >
      {settings.description && (
        <EditableField
          value={card.description}
          onSave={(description) => onUpdate({ description })}
          allowEmpty
          multiline
          placeholder="No description"
          underlineColor="secondary"
          accessibilityLabel="Description"
          style={[styles.text, styles.description]}
        />
      )}
      {settings.checklist && (
        <View style={styles.category}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryHeadline} accessibilityRole="header">
              Checklist
            </Text>
            <Button
              label="Create new task"
              variant="link"
              onPress={() => onUpdate({ checklist: [...card.checklist, newChecklistItem()] })}
            />
          </View>
          <Checklist label="task" items={card.checklist} onChange={(checklist) => onUpdate({ checklist })} />
        </View>
      )}
    </Modal>
  )
}

const styles = StyleSheet.create({
  name: {
    flex: 1,
  },
  nameText: {
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
  },
  text: {
    color: colors.text,
    fontFamily: fontFamily.primary,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
  description: {
    minHeight: lineHeight.md * 6,
    textAlignVertical: 'top',
  },
  category: {
    gap: spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  categoryHeadline: {
    color: colors.text,
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
  },
})
