import { Application } from 'express'
import { runMigrations } from '../db/index.js'
import { seedAdmin } from '../db/seedAdmin.js'
import { sessionStore } from '../utils/sessionStore.js'

const PORT = Number(process.env.API_PORT) || 5000
const SESSION_CLEANUP_INTERVAL = 60 * 60 * 1000
const SHUTDOWN_TIMEOUT = 5000

const deleteExpiredSessions = async (): Promise<void> => {
  try {
    await sessionStore.deleteExpired()
  } catch (error) {
    console.error('\nFailed to delete expired sessions:', error)
  }
}

export const startLocalServer = async (app: Application): Promise<void> => {
  try {
    await runMigrations()
    await seedAdmin()
    console.log('\nConnected to pagewise database.')

    await deleteExpiredSessions()
    setInterval(deleteExpiredSessions, SESSION_CLEANUP_INTERVAL).unref()

    const server = app.listen(PORT, () => {
      console.log(`\nLocal server running on port ${PORT}\n`)
      console.log('------------------------------------------------\n')
    })

    const shutdown = (): void => {
      server.close(() => process.exit(0))
      server.closeAllConnections()
      setTimeout(() => process.exit(0), SHUTDOWN_TIMEOUT).unref()
    }
    process.once('SIGTERM', shutdown)
    process.once('SIGINT', shutdown)
  } catch (error) {
    console.error('Failed to start local server:', error)
    console.log('------------------------------------------------\n')
    process.exit(1)
  }
}
