import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const root = path.resolve(__dirname, '../../../')
const requiredEnvVars = ['FRONTEND_URL', 'ADMIN_USER', 'ADMIN_PASS', 'DATABASE_URL', 'APP_ENV']

dotenv.config({
  path: path.join(root, '.env'),
  quiet: true,
})

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
})
