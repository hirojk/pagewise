import { useEffect, useRef, useState, type ComponentRef } from 'react'
import { Image, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native'
import { router } from 'expo-router'
import { isAxiosError } from 'axios'

import { Button } from '@components/ui/Button'
import { InputField } from '@components/ui/InputField'
import { useKeyboardHeight } from '@hooks/useIosInteractions'
import { useAuthStore } from '@stores/authStore'
import { colors, fontFamily, fontSize, lineHeight, NARROW_BREAKPOINT, spacing } from '@styles/theme'
import { randomIndex } from '@utils/helper'

const DEFAULT_LOCK_SECONDS = 5 * 60

const formatWait = (milliseconds: number): string => {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

const lockMessage = (lockedUntil: number): string =>
  `Too many failed logins. Try again in ${formatWait(lockedUntil - Date.now())}`

const backgroundImages = [
  {
    source: require('../../public/static/images/background_monet_waterlilies.webp'),
    altText: "Background image of Monet's Water Lilies painting",
  },
  {
    source: require('../../public/static/images/background_vangogh_starrynight.webp'),
    altText: "Background image of Vincent van Gogh's The Starry Night painting",
  },
]

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [backgroundIndex, setBackgroundIndex] = useState(() => randomIndex(backgroundImages.length))
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null)
  const background = backgroundImages[backgroundIndex]!
  const isNarrow = useWindowDimensions().width < NARROW_BREAKPOINT
  const keyboardHeight = useKeyboardHeight()

  useEffect(() => {
    if (lockedUntil === null) return

    const tick = () => {
      if (Date.now() >= lockedUntil) {
        setLockedUntil(null)
        setErrorMessage('')
      } else {
        setErrorMessage(lockMessage(lockedUntil))
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [lockedUntil])

  const handleLogin = async () => {
    if (lockedUntil !== null) return
    if (!username || !password) {
      setErrorMessage('Please enter username and password')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    try {
      await login(username, password)
      router.replace('/')
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined
      if (status === 429) {
        const retryAfter = isAxiosError(error) ? Number(error.response?.data?.retryAfter) : NaN
        const seconds = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : DEFAULT_LOCK_SECONDS
        setLockedUntil(Date.now() + seconds * 1000)
      } else if (status === 401) {
        setErrorMessage('Invalid username or password')
      } else {
        setErrorMessage('Login failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <View style={styles.page}>
      <Image source={background.source} accessibilityLabel={background.altText} style={styles.background} />
      <View style={[styles.center, { paddingBottom: styles.center.padding + keyboardHeight }]}>
        <View style={[styles.form, isNarrow && styles.formNarrow]}>
          <View style={styles.formInnerBorder} pointerEvents="none" />
          <Text style={styles.title} accessibilityRole="header">
            Pagewise
          </Text>
          <Text style={styles.error} accessibilityLiveRegion="polite" role="alert">
            {errorMessage}
          </Text>
          <InputField
            label="Username"
            underlineColor="secondary"
            background="secondary"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            returnKeyType="next"
            value={username}
            onChangeText={setUsername}
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <InputField
            ref={passwordRef}
            label="Password"
            underlineColor="secondary"
            background="secondary"
            secureTextEntry
            autoComplete="current-password"
            returnKeyType="go"
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={handleLogin}
          />
          <Button
            label="Login"
            onPress={handleLogin}
            disabled={isSubmitting || lockedUntil !== null}
            style={styles.submit}
          />
        </View>
      </View>
      <Button
        label="Change Background"
        variant="secondary"
        size="small"
        style={[styles.backgroundButton, isNarrow && styles.backgroundButtonNarrow]}
        onPress={() => setBackgroundIndex((index) => randomIndex(backgroundImages.length, index))}
      />
    </View>
  )
}

const BORDER_WIDTH = 3
const INNER_BORDER_INSET = 12 - BORDER_WIDTH

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  form: {
    width: '100%',
    maxWidth: 560,
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 48,
    paddingHorizontal: 80,
    borderWidth: BORDER_WIDTH,
    borderColor: colors.brandSecondary,
    borderRadius: 32,
    backgroundColor: colors.background,
    boxShadow: `0 0 16px ${colors.shadow}`,
  },
  formNarrow: {
    paddingHorizontal: spacing.xl,
  },
  formInnerBorder: {
    position: 'absolute',
    top: INNER_BORDER_INSET,
    right: INNER_BORDER_INSET,
    bottom: INNER_BORDER_INSET,
    left: INNER_BORDER_INSET,
    borderWidth: BORDER_WIDTH,
    borderColor: colors.brandSecondary,
    borderRadius: 32 - INNER_BORDER_INSET,
  },
  title: {
    color: colors.brandSecondary,
    fontFamily: fontFamily.primaryBold,
    fontSize: fontSize.xxl,
    lineHeight: lineHeight.xxl,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  error: {
    minHeight: lineHeight.md,
    color: colors.error,
    fontFamily: fontFamily.primary,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
  },
  submit: {
    width: 160,
    marginTop: 40,
  },
  backgroundButton: {
    position: 'absolute',
    right: spacing.pageX,
    bottom: spacing.pageY,
  },
  backgroundButtonNarrow: {
    right: spacing.lg,
    bottom: spacing.lg,
  },
})
