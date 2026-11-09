import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { CheckboxItemType } from '@pagewise/shared'

import { Checkbox } from '@components/ui/Checkbox'
import { EditableField } from '@components/ui/EditableField'
import { IconButton } from '@components/ui/IconButton'
import { colors, fontFamily, fontSize, lineHeight, spacing } from '@styles/theme'

type ChecklistProps = {
  label: string
  items: CheckboxItemType[]
  onChange: (items: CheckboxItemType[]) => void
}

export const newChecklistItem = (): CheckboxItemType => ({ label: '', isChecked: false })

export function Checklist({ label, items, onChange }: ChecklistProps) {
  const [previousLength, setPreviousLength] = useState(items.length)
  const [addedIndex, setAddedIndex] = useState(-1)
  if (items.length !== previousLength) {
    setPreviousLength(items.length)
    setAddedIndex(items.length > previousLength ? items.length - 1 : -1)
  }

  const replaceAt = (index: number, item: CheckboxItemType | null) =>
    onChange(item ? items.map((current, i) => (i === index ? item : current)) : items.filter((_, i) => i !== index))

  if (items.length === 0) {
    return <Text style={styles.message}>No {label} submitted yet.</Text>
  }

  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <View key={index} style={styles.item}>
          <Checkbox
            size={40}
            checked={item.isChecked}
            accessibilityLabel={item.label || `New ${label}`}
            onChange={(isChecked) => replaceAt(index, { ...item, isChecked })}
          />
          {item.isChecked ? (
            <Text style={[styles.text, styles.textChecked]}>{item.label}</Text>
          ) : (
            <View style={styles.field}>
              <EditableField
                value={item.label}
                autoFocus={index === addedIndex && item.label === ''}
                onSave={(newLabel) => replaceAt(index, { ...item, label: newLabel })}
                onEmpty={() => replaceAt(index, null)}
                underlineColor="secondary"
                accessibilityLabel={label}
                style={styles.text}
              />
            </View>
          )}
          <IconButton
            icon="delete"
            size={36}
            borderColor="secondary"
            accessibilityLabel={`Delete ${label}`}
            onPress={() => replaceAt(index, null)}
          />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  message: {
    padding: 3,
    color: colors.textTertiary,
    fontFamily: fontFamily.primary,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  field: {
    flex: 1,
  },
  text: {
    flex: 1,
    paddingHorizontal: spacing.sm,
    color: colors.text,
    fontFamily: fontFamily.primary,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
  textChecked: {
    textDecorationLine: 'line-through',
  },
})
