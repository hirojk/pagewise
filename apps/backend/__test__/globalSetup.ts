import path from 'path'
import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'

// Recreates the test database on every run, so tests also prove the migrations work from empty.
export default async function setup({ config }: { config: { env: Record<string, string> } }): Promise<void> {
  const testUrl = new URL(config.env.DATABASE_URL)
  const testDatabase = testUrl.pathname.slice(1)

  if (!testDatabase.endsWith('_test')) {
    throw new Error(`Refusing to recreate "${testDatabase}": the test database name must end in _test`)
  }

  const adminUrl = new URL(testUrl)
  adminUrl.pathname = '/postgres'
  const admin = new pg.Client({ connectionString: adminUrl.href })

  try {
    await admin.connect()
  } catch (error) {
    throw new Error('Backend tests need Postgres. Start it with: docker compose up -d', { cause: error })
  }

  await admin.query(`DROP DATABASE IF EXISTS "${testDatabase}" WITH (FORCE)`)
  await admin.query(`CREATE DATABASE "${testDatabase}"`)
  await admin.end()

  const pool = new pg.Pool({ connectionString: testUrl.href })
  await migrate(drizzle(pool), { migrationsFolder: path.resolve(process.cwd(), 'db/migrations') })
  await pool.end()
}
