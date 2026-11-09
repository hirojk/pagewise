import { useRef, useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { type Href } from 'expo-router'

import { type IconName } from '@components/ui/Icon'
import { Initial } from '@components/ui/Initial'
import { PressableLink } from '@components/ui/PressableLink'
import { colors, fontFamily, fontSize, lineHeight } from '@styles/theme'

type Usage = 'project' | 'page'

type PageItemProps = {
  usage: Usage
  label: string
  href: Href
  icon?: IconName
  subline?: string
}

export function PageItem({ usage, label, href, icon, subline }: PageItemProps) {
  const theme = colors[usage]
  const initial = <Initial label={label} icon={icon} variant="secondary" usage={usage} />

  return (
    <PressableLink
      href={href}
      style={[styles.item, { backgroundColor: theme.background }]}
      pressedStyle={styles.pressed}
    >
      {initial}
      <View style={styles.content}>
        <Text style={[styles.headline, { color: theme.color }]} numberOfLines={2}>
          {label || 'Untitled'}
        </Text>
        {subline && label ? <Text style={[styles.subline, { color: theme.colorSecondary }]}>{subline}</Text> : null}
      </View>
    </PressableLink>
  )
}

type DraftPageItemProps = {
  usage: Usage
  icon?: IconName
  onConfirm: (name: string) => Promise<unknown> | void
  onCancel: () => void
}

export function DraftPageItem({ usage, icon, onConfirm, onCancel }: DraftPageItemProps) {
  const theme = colors[usage]

  return (
    <View style={[styles.item, { backgroundColor: theme.background }]}>
      <Initial label="" icon={icon} variant="secondary" usage={usage} />
      <View style={styles.content}>
        <NameInput color={theme.color} onConfirm={onConfirm} onCancel={onCancel} />
      </View>
    </View>
  )
}

type NameInputProps = Pick<DraftPageItemProps, 'onConfirm' | 'onCancel'> & { color: string }

function NameInput({ color, onConfirm, onCancel }: NameInputProps) {
  const [draft, setDraft] = useState('')
  const isDone = useRef(false)

  const finish = async () => {
    if (isDone.current) return
    isDone.current = true
    const name = draft.trim()
    try {
      await (name ? onConfirm(name) : onCancel())
    } catch (error) {
      console.error('Error saving name:', error)
      isDone.current = false
    }
  }

  return (
    <TextInput
      autoFocus
      value={draft}
      onChangeText={setDraft}
      onSubmitEditing={finish}
      onBlur={finish}
      returnKeyType="done"
      accessibilityLabel="Name"
      style={[styles.headline, styles.input, { color, outlineColor: color }]}
    />
  )
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
    marginHorizontal: 16,
  },
  headline: {
    padding: 4,
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.md,
  },
  input: {
    outlineWidth: 2,
    outlineStyle: 'solid',
    borderRadius: 2,
  },
  subline: {
    padding: 4,
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    opacity: 0.8,
  },
})
