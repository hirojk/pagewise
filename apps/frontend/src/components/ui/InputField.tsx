import { useId, useState, type ComponentRef, type Ref } from 'react'
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'

import { withoutIosLineHeight } from '@hooks/useIosInteractions'
import { colors, fontFamily, fontSize, lineHeight } from '@styles/theme'

type InputFieldProps = TextInputProps & {
  label?: string
  underlineColor?: 'primary' | 'secondary'
  background?: 'primary' | 'secondary' | 'tertiary'
  ref?: Ref<ComponentRef<typeof TextInput>>
}

const underlineColors = { primary: colors.brandPrimary, secondary: colors.brandSecondary }
const backgroundColors = {
  primary: colors.surfaceSubtle,
  secondary: colors.surfaceWarm,
  tertiary: colors.surfaceSpecial,
}

export function InputField({
  label,
  underlineColor = 'primary',
  background = 'primary',
  style,
  onFocus,
  onBlur,
  ref,
  ...props
}: InputFieldProps) {
  const labelId = useId()
  const [isFocused, setIsFocused] = useState(false)

  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text nativeID={labelId} style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        aria-labelledby={label ? labelId : undefined}
        style={withoutIosLineHeight(
          [
            styles.field,
            { borderBottomColor: underlineColors[underlineColor], backgroundColor: backgroundColors[background] },
            isFocused && styles.fieldFocused,
            style,
          ],
          props.multiline,
        )}
        placeholderTextColor={colors.textTertiary}
        onFocus={(event) => {
          setIsFocused(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setIsFocused(false)
          onBlur?.(event)
        }}
        {...props}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: 8,
  },
  label: {
    fontFamily: fontFamily.primary,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: colors.text,
  },
  field: {
    width: '100%',
    padding: 8,
    borderBottomWidth: 1,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    color: colors.text,
    fontFamily: fontFamily.secondary,
    fontSize: fontSize.md,
    outlineWidth: 0,
  },
  fieldFocused: {
    borderRadius: 3,
    borderBottomColor: 'transparent',
    backgroundColor: colors.surfaceWhite,
    outlineWidth: 2,
    outlineStyle: 'solid',
    outlineColor: colors.text,
    outlineOffset: 2,
  },
})
