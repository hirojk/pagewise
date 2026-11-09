// Starts `expo start` (with any arguments, e.g. --web or --tunnel) and points the app at
// the backend port from the root .env, so API_PORT is set in one place.
//
// EXPO_PUBLIC_API_PORT is only filled in from API_PORT when neither the shell nor
// apps/frontend/.env(.local) sets it, so those overrides still win. Only API_PORT is read
// from the root .env, because that file also holds backend secrets.

import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parseEnv } from 'node:util'

const readEnv = (relativePath) => {
  const file = fileURLToPath(new URL(relativePath, import.meta.url))
  return existsSync(file) ? parseEnv(readFileSync(file, 'utf8')) : {}
}

const frontendEnv = { ...readEnv('../.env'), ...readEnv('../.env.local') }
const apiPort = process.env.API_PORT ?? readEnv('../../../.env').API_PORT

const env = { ...process.env }
if (!env.EXPO_PUBLIC_API_PORT && !frontendEnv.EXPO_PUBLIC_API_PORT && apiPort) {
  env.EXPO_PUBLIC_API_PORT = apiPort
}

const expo = spawn('expo', ['start', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
})

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => expo.kill(signal))
expo.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)))
