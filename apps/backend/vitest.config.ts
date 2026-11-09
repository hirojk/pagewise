import { configDefaults, defineConfig } from 'vitest/config'

const testDatabaseUrl = process.env.TEST_DATABASE_URL || 'postgres://pagewise:pagewise@localhost:5432/pagewise_test'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    exclude: [...configDefaults.exclude, 'dist/**'],
    globalSetup: './__test__/globalSetup.ts',
    env: {
      DATABASE_URL: testDatabaseUrl,
      ADMIN_USER: 'Admin',
      ADMIN_PASS: 'admin-password',
      APP_ENV: 'development',
    },
  },
})
