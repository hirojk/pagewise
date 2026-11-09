# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project follows [Semantic Versioning](https://semver.org/).

## [1.0.0]

First stable release.

### Added

- Page type menu when creating a new page
- Health endpoint for the backend and database, used by deploy healthchecks

### Changed

- CI runs only on ready merge requests, `dev`, `main`, or by hand

### Fixed

- Unsaved field edits are kept when a dialog closes
- Keyboard closes together with a dialog
- Only a newly added checklist item gets focus
- Page item background in the sidebar

## [0.4.0]

### Added

- Expo (React Native) app for web, tablet, and Expo Go
- Login rate limiting
- Project archive for deleted users' projects
- Endpoint to list a user's projects

### Changed

- Simpler project and page creation flow
- Hardened session handling and CORS
- Improved local development setup

### Removed

- Vue frontend, replaced by the Expo app
- Unused configuration and Vercel CORS access

### Fixed

- Access control for users, projects, and boards
- Missing input validation on login and user update

## [0.3.0]

### Added

- Docker and Docker Compose setup
- GitLab CI pipeline
- API tests against PostgreSQL
- Database backup script

### Changed

- Migrated from MongoDB to PostgreSQL with Drizzle ORM
- Admin is now a regular database user
- Data validated against shared schemas
- Node.js 26 support

### Fixed

- Logout with Bearer token
- Dependency vulnerabilities

## [0.2.0]

### Added

- Refreshed UI
- Test coverage with Vitest
- Opaque token authentication

## [0.1.1]

### Added

- Accessibility improvements

### Changed

- Monorepo restructured into `apps/` and `packages/`
- Moved from SPA to SSR

### Fixed

- Touch and input behavior on iOS

## [0.1.0]

Initial release.

### Added

- Project management
- Kanban-style board with columns, cards, and configurable card fields
- Monorepo with Turborepo, pnpm, and a shared package
- Vercel deployment
