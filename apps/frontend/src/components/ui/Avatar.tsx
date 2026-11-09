import type { ComponentRef, Ref } from 'react'
import { Image, Pressable, StyleSheet, View, type PressableProps } from 'react-native'

import { colors } from '@styles/theme'

type AvatarProps = Omit<PressableProps, 'children'> & {
  ref?: Ref<ComponentRef<typeof View>>
}

export function Avatar({ style, ...props }: AvatarProps) {
  return (
    <Pressable
      accessibilityRole="button"
      aria-haspopup="menu"
      accessibilityLabel="Open user menu"
      style={(state) => [
        styles.avatar,
        state.pressed && styles.pressed,
        typeof style === 'function' ? style(state) : style,
      ]}
      {...props}
    >
      <Image
        source={require('../../../public/static/images/avatar_placeholder.webp')}
        accessibilityLabel="Placeholder picture of Jan"
        style={styles.image}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    boxShadow: `0 0 0 2px ${colors.background}, 0 0 0 4px ${colors.brandPrimary}`,
  },
  pressed: {
    opacity: 0.8,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
})
