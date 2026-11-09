import path from 'path'
import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'

export const PG_UNIQUE_VIOLATION = '23505'
export const PG_FOREIGN_KEY_VIOLATION = '23503'

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

pool.on('error', (error) => {
  console.error('\nDatabase pool error:', error)
})

export const db = drizzle(pool)

export const runMigrations = async (): Promise<void> => {
  await migrate(db, { migrationsFolder: path.resolve(process.cwd(), 'db/migrations') })
}

export const hasPgErrorCode = (error: unknown, code: string): boolean => {
  const cause = (error as { cause?: { code?: string } }).cause
  return cause?.code === code
}
