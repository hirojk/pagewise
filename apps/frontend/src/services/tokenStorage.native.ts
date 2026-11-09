import * as SecureStore from 'expo-secure-store'

// Native version: the token is kept in the iOS Keychain or Android Keystore.
const TOKEN_KEY = 'sessionToken'

export const tokenStorage = {
  get: (): Promise<string | null> => SecureStore.getItemAsync(TOKEN_KEY),
  set: (token: string): Promise<void> => SecureStore.setItemAsync(TOKEN_KEY, token),
  remove: (): Promise<void> => SecureStore.deleteItemAsync(TOKEN_KEY),
}
