import { Router } from 'express'
import { pool } from '../db/index.js'

const DB_TIMEOUT = 2000

const router = Router()

router.get('/', async (_req, res) => {
  let timer: NodeJS.Timeout | undefined
  try {
    await Promise.race([
      pool.query('SELECT 1'),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Database health check timed out')), DB_TIMEOUT)
      }),
    ])
    res.status(200).json({ status: 'ok' })
  } catch (error) {
    console.error('\nHealth check failed:', error)
    res.status(503).json({ status: 'error' })
  } finally {
    clearTimeout(timer)
  }
})

export default router
