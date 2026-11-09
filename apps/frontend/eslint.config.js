// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
  expoConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
      'no-undef': 'off',
      'no-console': ['error', { allow: ['warn', 'error', 'info'] }],
      'no-unused-expressions': 'error',
      'object-shorthand': ['error', 'always'],
    },
  },
  {
    ignores: ['dist/*', '.expo/*', 'expo-env.d.ts', 'node_modules/**', '.turbo/**'],
  },
])
