// Starts the local PostgreSQL container and waits until it is healthy.
// If Docker is not available, it only warns, so `pnpm dev` can still use a database
// that is already running (the backend reports its own error if it cannot connect).
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const compose = fileURLToPath(new URL('../../../docker-compose.yml', import.meta.url))
const result = spawnSync('docker', ['compose', '-f', compose, 'up', '-d', '--wait', 'postgres'], {
  stdio: 'inherit',
})

if (result.error || result.status !== 0) {
  console.warn(
    '\n[db:up] Could not start the PostgreSQL container with Docker (see above). ' +
      'Continuing; make sure a database is reachable at DATABASE_URL.\n',
  )
}
