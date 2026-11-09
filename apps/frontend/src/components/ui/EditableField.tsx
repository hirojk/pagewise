import { useEffect, useRef, useState, type ComponentProps, type ComponentRef } from 'react'
import { TextInput } from 'react-native'

import { InputField } from '@components/ui/InputField'

type EditableFieldProps = Omit<
  ComponentProps<typeof InputField>,
  'value' | 'onChangeText' | 'onBlur' | 'onSubmitEditing' | 'ref'
> & {
  value: string
  onSave: (value: string) => Promise<void> | void
  onEmpty?: () => Promise<void> | void
  allowEmpty?: boolean
}

type SaveProps = Pick<EditableFieldProps, 'value' | 'onSave' | 'onEmpty' | 'allowEmpty'>

const commit = async (text: string | null, { value, onSave, onEmpty, allowEmpty }: SaveProps) => {
  const trimmed = (text ?? value).trim()
  if (!trimmed && onEmpty) await onEmpty()
  else if (!trimmed && !allowEmpty) return
  else if (trimmed !== value) await onSave(trimmed)
}

export function EditableField({
  value,
  onSave,
  onEmpty,
  allowEmpty,
  multiline,
  onKeyPress,
  onFocus,
  ...props
}: EditableFieldProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null)
  const isCancelled = useRef(false)
  const draftRef = useRef<string | null>(null)
  const isEditing = useRef(false)
  const saveProps = useRef<SaveProps>({ value, onSave, onEmpty, allowEmpty })

  useEffect(() => {
    saveProps.current = { value, onSave, onEmpty, allowEmpty }
  })

  useEffect(
    () => () => {
      if (!isEditing.current || isCancelled.current) return
      commit(draftRef.current, saveProps.current).catch((error) => console.error('Error saving:', error))
    },
    [],
  )

  const changeDraft = (text: string) => {
    draftRef.current = text
    setDraft(text)
  }

  const save = async () => {
    const text = draftRef.current
    const wasCancelled = isCancelled.current
    isEditing.current = false
    isCancelled.current = false
    draftRef.current = null
    try {
      if (!wasCancelled) await commit(text, saveProps.current)
    } catch (error) {
      console.error('Error saving:', error)
    } finally {
      setDraft(null)
    }
  }

  return (
    <InputField
      ref={inputRef}
      value={draft ?? value}
      onChangeText={changeDraft}
      onFocus={(event) => {
        isEditing.current = true
        onFocus?.(event)
      }}
      onSubmitEditing={multiline ? undefined : () => inputRef.current?.blur()}
      onBlur={save}
      onKeyPress={(event) => {
        onKeyPress?.(event)
        if (event.nativeEvent.key !== 'Escape') return
        isCancelled.current = true
        inputRef.current?.blur()
      }}
      multiline={multiline}
      returnKeyType={multiline ? 'default' : 'done'}
      {...props}
    />
  )
}
