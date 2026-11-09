# Pagewise App (1.0.0)

Pagewise is a project management application designed to organize and manage projects in a flexible and customizable way. It focuses on reusable components and configurable layouts, allowing each project to be tailored to specific needs.

Currently, the app includes a **Board** component, inspired by a Trello-style Kanban board, for organizing tasks. Additional components and features are planned for future releases.

⚠️ The application is currently optimized for desktop and tablet devices.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Expo Go](#expo-go)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Deployment](#deployment)
- [Issues and future Changes](#issues-and-future-changes)

For the design of the system, see [architecture.md](.docs/architecture.md). To contribute, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Tech Stack

This project is structured as a monorepo using [Turborepo](https://turbo.build/) with [pnpm](https://pnpm.io/) workspaces.

### Frontend

A [React Native](https://reactnative.dev/) app built with [Expo](https://expo.dev/). One codebase runs on the web, where it can be installed on a tablet's home screen as a web app, and in Expo Go on iOS and Android.

- **Framework:** React Native with Expo (TypeScript)
- **Routing:** Expo Router
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Code Quality:** ESLint, Prettier
- **Tests:** Vitest

### Backend

- **Framework:** Express.js (TypeScript)
- **Database:** PostgreSQL
- **ORM:** Drizzle
- **Tests:** Vitest, Supertest

### Tooling

- **Containers:** Docker, Docker Compose
- **CI/CD:** GitLab CI

## Getting Started

You need Node.js 22.12 or newer (up to 26), [pnpm](https://pnpm.io/) 11, and Docker.

Clone the repository and install dependencies:

```sh
pnpm install
```

Copy `.env.example` to `.env` and set `ADMIN_USER` and `ADMIN_PASS`. They become the admin login.

Start the development server (needs Docker running):

```sh
pnpm dev
```

This starts the PostgreSQL container from `docker-compose.yml` and waits until it is ready. It starts the API on http://localhost:5000 and the frontend (see [Frontend](#frontend-1) below). Database migrations run automatically at startup. The container keeps running after `pnpm dev` stops. To stop it:

```sh
pnpm --filter @pagewise/backend db:down
```

⚠️ For access to a test account and login credentials, please contact the author.

## Expo Go

The Expo app in `apps/frontend` covers login, the project list, the project pages and the board.

`pnpm dev` starts the frontend together with the backend. To start only the frontend, with the backend and database already running:

```sh
pnpm --filter @pagewise/frontend dev:web   # web, on http://localhost:8081
pnpm --filter @pagewise/frontend dev       # QR code for Expo Go
```

### On a phone or tablet with Expo Go

Expo Go only opens the project when Expo CLI on your computer is signed in to the same Expo account. `pnpm dev` checks this before starting the client:

- signed in already (once is enough, the session is kept) → it just starts;
- `EXPO_USERNAME` and `EXPO_PASSWORD` in `apps/frontend/.env.local` (git-ignored) → it signs in with them;
- otherwise → it shows the `expo login` prompt in the client's pane of the Turbo UI (select the pane to type).

1. Install **Expo Go** from the App Store or Play Store.
2. Make sure the device can reach your computer on the local network, on port 8081 (development server) and 5000 (API). On Windows with WSL 2, turn on [mirrored networking](https://learn.microsoft.com/windows/wsl/networking#mirrored-mode-networking) and allow both ports in the Windows firewall.
3. Run `pnpm --filter @pagewise/frontend dev` and scan the QR code with the device's camera.

The app calls the API on the computer that serves the development bundle. To use a different API, copy `apps/frontend/.env.example` to `apps/frontend/.env` and set `EXPO_PUBLIC_API_URL`. That is also needed with `dev:tunnel`, which works without network setup but only reaches the development server, not your local API.

### Web build

```sh
pnpm --filter @pagewise/frontend build     # writes apps/frontend/dist
```

In development, the backend listens on `API_PORT` from the root `.env` (default 5000), and the frontend calls the same port. The web build calls the API on the host it was opened from, at `EXPO_PUBLIC_API_PORT` (default 5000). `apps/frontend/Dockerfile` builds it into an nginx image. To install it on an iPad, open it in Safari and choose **Share > Add to Home Screen**.

## Project Structure

The Project files are structured like this:

```sh
├── apps
│   ├── backend                         # Backend (Node.js / API layer)
│   │   ├── __test__                    # Unit and API route tests
│   │   ├── config                      # Configuration files (environment, middleware, routes, etc.)
│   │   ├── controllers                 # Request handlers and business logic
│   │   ├── db                          # Database connection, admin seeding, and migrations
│   │   ├── middleware                  # Express middleware (auth, logging, etc.)
│   │   ├── models                      # Database table definitions
│   │   ├── routes                      # API route definitions
│   │   ├── types                       # TypeScript type definitions
│   │   ├── utils                       # Utility/helper functions
│   │   │
│   │   ├── Dockerfile                  # Backend container image
│   │   └── server.ts                   # Application entry point
│   │
│   └── frontend                        # Frontend (Expo / React Native, web and mobile)
│       ├── public                      # Web-only files: index.html template, manifest, icons
│       ├── src
│       │   ├── __test__                # Unit tests
│       │   ├── app                     # Screens and layouts (Expo Router, file-based routes)
│       │   ├── components              # Reusable UI components
│       │   ├── services                # API client and token storage
│       │   ├── stores                  # State management (Zustand)
│       │   └── theme.ts                # Colors and spacing from the design tokens
│       │
│       ├── app.json                    # Expo configuration
│       └── Dockerfile                  # Web build served by nginx
│
├── packages
│   └── shared                          # Shared code between frontend & backend
│       ├── __test__                    # Unit tests
│       ├── constants                   # Shared constants
│       ├── schemas                     # Shared validation schemas
│       ├── utils                       # Shared utility functions
│       │
│       └── index.ts                    # Shared module entry point
│
├── .docs                               # Architecture and deployment guides
├── scripts                             # Operational scripts (database backup)
│
├── docker-compose.yml                  # Local development database
├── docker-compose.deploy.yml           # Staging and production containers
├── .gitlab-ci.yml                      # CI/CD pipeline
├── package.json                        # Project dependencies and scripts
└── turbo.json                          # Turborepo configuration
```

## Testing

The project uses Vitest for testing across all workspace packages.

Run the complete test suite from the repository root:

```sh
pnpm test
```

This command executes all configured Vitest tests in the monorepo, including the frontend, backend and shared packages.

Backend tests need the database from `docker compose up -d`. They create and recreate their own `pagewise_test` database, so your development data is not touched. Set `TEST_DATABASE_URL` to use a different server.

## Deployment

The application runs as Docker containers. [GitLab CI](.gitlab-ci.yml) tests each change, then builds the images and deploys them automatically:

- **Staging:** every merge into `dev`
- **Production:** every merge into `main`

Each environment has its own database. For setup, configuration, and backups, see the [deployment guide](.docs/deployment.md).

## Issues and future Changes

The following improvements are planned for upcoming releases:

- Introduce a Documentation module for project notes, knowledge bases, and wiki-style content

🙏 Feedback is always welcome. If you encounter any critical issues or bugs, please report them so they can be resolved promptly.
