import { useEffect } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { Stack, usePathname } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFonts } from 'expo-font'

import { useAuthStore } from '@stores/authStore'
import { colors, fonts } from '@styles/theme'

export default function RootLayout() {
  const isLoggedIn = useAuthStore((state) => !!state.user)
  const isLoading = useAuthStore((state) => state.isLoading)
  const fetchUser = useAuthStore((state) => state.fetchUser)
  const [fontsLoaded, fontError] = useFonts(fonts)
  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  const hasStatusBarBackground = pathname !== '/'

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Wait for the session check, so a reload doesn't bounce a logged-in user to /login.
  if (isLoading || (!fontsLoaded && !fontError)) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.brandPrimary} size="large" />
      </View>
    )
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
      {hasStatusBarBackground && (
        <View style={[styles.statusBarBackground, { height: insets.top }]} pointerEvents="none" />
      )}
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
})
