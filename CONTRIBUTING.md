# Contributing to Pagewise

Thank you for your interest in contributing to Pagewise.

This document outlines the development workflow, naming conventions, and coding practices to ensure consistency across the project.

## Table of Contents

- [Development Setup](#development-setup)
- [Branching Strategy](#branching-strategy)
- [Branch and Commit Naming](#branch-and-commit-naming)
- [Recommended Practices](#recommended-practices)
- [Database Changes](#database-changes)
- [Code Quality](#code-quality)
- [Testing](#testing)
- [Continuous Integration](#continuous-integration)

## Development Setup

You need Node.js 22.12 or newer (up to 26), [pnpm](https://pnpm.io/) 11, and Docker. Follow [Getting Started](README.md#getting-started) in the README to run the app.

To understand how the code fits together before changing it, read [architecture.md](.docs/architecture.md).

## Branching Strategy

This project follows a feature-based workflow:

- **main** → stable, production-ready code
- **dev** → active development and staging
- **feature branches** → all changes are developed from `dev`

### Workflow

1. Create a new feature or fix branch from `dev`
2. Implement your changes
3. Open a merge request targeting `dev` (⚠️ Direct merges into `main` are not allowed)
4. After review, the branch is merged into dev, which deploys to staging
5. When ready for release, a Owner or Maintainer merges dev into main, which deploys to production

## Branch and Commit Naming

All branches and commits must follow conventional naming standards.

### Branch Naming

- Use lowercase letters and hyphens only
- Keep names short and descriptive

**Prefixes:**

- `feat/` → new features
- `fix/` → bug fixes
- `chore/` → maintenance or non-code changes
- `release/` → release preparation

**Examples:**

```sh
feat/new-feature
fix/header-bug
chore/update-dependencies
```

More information: [Conventional Branch](https://conventional-branch.github.io/)

### Commits

Use the following format:

```sh
<type>(optional scope): <description>
```

Common types:

- **feat:** – new feature
- **fix:** – bug fix
- **refactor:** – code improvements without behavior changes
- **chore:** – maintenance tasks

⚠️ Merge commits should follow: `chore: merge with <branch> from PR #<pr-number>`

```sh
feat: add configurable board layout
fix: resolve header rendering issue
refactor: improve validation logic
chore: update dependencies
chore: merge with dev
```

More information: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

## Recommended Practices

For the frontend, the following conventions must be followed:

- Write components as function components in TypeScript
- Use the colors, spacing, and fonts from `src/theme.ts` instead of hard-coded values

## Database Changes

Tables are defined in `apps/backend/models/`. To change one, edit the model and generate a migration, then commit the generated files:

```sh
pnpm --filter @pagewise/shared build
pnpm --filter @pagewise/backend db:generate
```

Migrations run automatically when the backend starts, and `pnpm dev` restarts the backend when a migration file changes.

For a hand-written migration (`drizzle-kit generate --custom`), stop `pnpm dev` first. The command creates an empty file, and a running backend would apply and record it before you've written the SQL; the finished SQL would then never run.

⚠️ Do not edit existing migration files or anything in `db/migrations/meta`. Other databases may already have applied them.

## Code Quality

⚠️ Before every commit, it is highly recommended to run one of the following commands. `pnpm lint` reports problems, and `pnpm lint:fix` also fixes the ones it can:

```sh
pnpm lint
# or
pnpm lint:fix
```

This ensures consistent formatting and adherence to project standards.

## Testing

The project uses Vitest for unit and integration testing across all packages.

- **Frontend** – Tests cover plain TypeScript modules, such as how the API address is chosen on web and native. Before committing frontend changes, also run `pnpm --filter @pagewise/frontend type-check`, and check the change in the browser and, for touch or layout changes, in Expo Go.
- **Backend** – Unit tests cover API responses, helper functions, and the authentication middleware. Route tests send real HTTP requests through the API to a real PostgreSQL database.
- **Shared package** – Tests verify schemas and utility/helper functions to ensure consistent validation and reusable logic across the application.

Backend tests need the database to be running. `pnpm dev` starts it, or start it on its own with:

```sh
docker compose up -d
```

They create and recreate their own `pagewise_test` database, so your development data is not touched. Set `TEST_DATABASE_URL` to use a different server.

Run all tests from the repository root:

```sh
pnpm test
```

This command executes the full Vitest test suite across backend, frontend, and shared workspace packages in watch mode, automatically re-running tests whenever changes are detected. To run them once, use `CI=true pnpm test`.

Add or update tests with every behavior change, especially in API routes.

## Continuous Integration

GitLab CI runs before a merge and before a deployment, not on every push:

- **Push to a feature branch:** no pipeline. Run `pnpm lint` and `pnpm test` locally.
- **Draft merge request:** no pipeline, so you can open the merge request early and keep pushing.
- **Merge request marked as ready:** the full check runs, and again on every later push to it.
- **Push or merge into `dev` or `main`:** the full check runs, then the build and deployment.
- **By hand:** *Build → Pipelines → Run pipeline* checks any branch.

The checks:

- **Merge target** – Merge requests must follow the [workflow](#workflow): only `dev` can merge into `main`, and only `feat/`, `fix/`, `chore/`, or `release/` branches can merge into `dev`.
- **Lint** – Must pass.
- **Tests** – Must pass, including the route tests against PostgreSQL.
- **Dependency audit** – Reports known vulnerabilities as a warning, without blocking the pipeline. Fix what you can with `pnpm audit`.

After a merge, `dev` is deployed to staging and `main` to production.
