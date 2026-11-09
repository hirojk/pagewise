import { useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import type { BoardCardType, BoardSettingType } from '@pagewise/shared'

import { Icon } from '@components/ui/Icon'
import { getPriorityIcon } from '@constants/priority'
import { colors, fontFamily, fontSize, lineHeight, spacing } from '@styles/theme'

const LONG_PRESS_TIME = 400

type BoardCardProps = {
  card: BoardCardType
  settings: BoardSettingType['cards']
  onOpen: () => void
  onRename: (name: string) => void
  onRemove: () => void
}

export function BoardCard({ card, settings, onOpen, onRename, onRemove }: BoardCardProps) {
  const showPriority = settings.priority && card.priority !== 'Medium'
  const showDescription = settings.description && card.description !== ''
  const showChecklist = settings.checklist && card.checklist.length > 0

  if (card.name === '') {
    return (
      <View style={styles.card}>
        <NameInput onConfirm={onRename} onCancel={onRemove} />
      </View>
    )
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${card.name} card details`}
      onPress={onOpen}
      onLongPress={() => {}}
      delayLongPress={LONG_PRESS_TIME}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <Text style={styles.heading}>{card.name}</Text>
        {showPriority && <Icon name={getPriorityIcon(card.priority)} size={22} />}
      </View>
      {showDescription || showChecklist ? (
        <View style={styles.group}>
          {showDescription && (
            <Text style={styles.text} numberOfLines={3}>
              {card.description}
            </Text>
          )}
          {showChecklist && (
            <View style={styles.checklist}>
              {card.checklist.map((item, index) => (
                <View key={index} style={styles.subtask}>
                  <Svg width={10} height={10} viewBox="0 0 10 10">
                    <Circle
                      cx={5}
                      cy={5}
                      r={4}
                      strokeWidth={1}
                      fill={item.isChecked ? colors.checkbox.activeBackground : colors.checkbox.inactiveBackground}
                      stroke={item.isChecked ? colors.checkbox.activeBorder : colors.checkbox.inactiveBorder}
                    />
                  </Svg>
                  <Text style={[styles.text, styles.subtaskLabel, item.isChecked && styles.checked]}>{item.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : null}
    </Pressable>
  )
}

function NameInput({ onConfirm, onCancel }: { onConfirm: (name: string) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState('')
  const isDone = useRef(false)

  const finish = () => {
    if (isDone.current) return
    isDone.current = true
    const name = draft.trim()
    if (name) onConfirm(name)
    else onCancel()
  }

  return (
    <TextInput
      autoFocus
      value={draft}
      onChangeText={setDraft}
      onSubmitEditing={finish}
      onBlur={finish}
      returnKeyType="done"
      accessibilityLabel="Card name"
      style={[styles.heading, styles.input]}
    />
  )
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    width: '100%',
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.surfaceWhite,
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heading: {
    flex: 1,
    padding: 4,
    color: colors.text,
    fontFamily: fontFamily.primary,
    fontSize: fontSize.md,
  },
  input: {
    outlineWidth: 2,
    outlineStyle: 'solid',
    outlineColor: colors.text,
    borderRadius: 2,
  },
  group: {
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: 4,
  },
  text: {
    color: colors.text,
    fontFamily: fontFamily.primary,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
  checklist: {
    gap: spacing.sm,
  },
  subtask: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subtaskLabel: {
    flexShrink: 1,
  },
  checked: {
    textDecorationLine: 'line-through',
  },
})
