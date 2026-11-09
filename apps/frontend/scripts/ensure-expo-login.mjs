// Makes sure Expo CLI is signed in before `expo start`, so Expo Go (signed in to the same
// account) can open the project. Runs as part of `pnpm dev`.
//
// 1. Already signed in (the session is saved in ~/.expo) → nothing to do.
// 2. EXPO_TOKEN set → Expo CLI uses it on its own → nothing to do.
// 3. EXPO_USERNAME + EXPO_PASSWORD set (e.g. in apps/frontend/.env.local, git-ignored)
//    → signs in with them, no prompts.
// 4. Otherwise → the normal `expo login` prompt (once; the session is kept afterwards).
//
// It never blocks the dev server: if signing in fails, Expo still starts.

import { spawnSync } from 'node:child_process'

const expo = (args, options = {}) =>
  spawnSync('expo', args, { shell: process.platform === 'win32', encoding: 'utf8', ...options })

const isSignedIn = () => expo(['whoami'], { stdio: 'pipe' }).status === 0

if (isSignedIn()) process.exit(0)

const EXPO_TOKEN = process.env.EXPO_TOKEN
const EXPO_USERNAME = process.env.EXPO_USERNAME
const EXPO_PASSWORD = process.env.EXPO_PASSWORD

if (EXPO_TOKEN) {
  console.warn('[expo-login] EXPO_TOKEN is set, but Expo CLI does not accept it. Check the token on expo.dev.')
  process.exit(0)
}

if (EXPO_USERNAME && EXPO_PASSWORD) {
  console.log(`[expo-login] Signing in to Expo CLI as "${EXPO_USERNAME}"…`)
  // Password through stdin ("-p -"), so it doesn't show up in the process list.
  const result = expo(['login', '--no-browser', '-u', EXPO_USERNAME, '-p', '-'], {
    input: EXPO_PASSWORD,
    stdio: ['pipe', 'inherit', 'inherit'],
  })
  if (result.status !== 0) console.warn('[expo-login] Signing in failed; starting Expo anyway.')
  process.exit(0)
}

if (!process.stdin.isTTY) {
  console.warn(
    '[expo-login] Expo CLI is not signed in. Run `npx expo login` once in apps/frontend, ' +
      'or set EXPO_USERNAME and EXPO_PASSWORD in apps/frontend/.env.local.',
  )
  process.exit(0)
}

console.log('[expo-login] Expo CLI is not signed in (needed for Expo Go). Sign in once:')
expo(['login'], { stdio: 'inherit' })
