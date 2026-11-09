# Deployment

This guide explains how to deploy Pagewise with Docker and GitLab CI, and how to back up its database. For how the containers fit together, see [architecture.md](architecture.md#deployment).

## Table of Contents

- [Environments](#environments)
- [Requirements](#requirements)
- [Configuration](#configuration)
- [GitLab CI Setup](#gitlab-ci-setup)
- [Deploying Without CI](#deploying-without-ci)
- [Database Backups](#database-backups)
- [Troubleshooting](#troubleshooting)

## Environments

Each environment is a separate Docker Compose project with its own containers, database, and settings:

| Environment | Deployed from | Compose project |
|---|---|---|
| Staging | `dev` | `pagewise-staging` |
| Production | `main` | `pagewise-production` |

Each project has three containers, named `pagewise-<environment>-postgres`, `-frontend` and `-backend`.

## Requirements

- A deployment host running Docker with the Compose plugin
- For CI deployments, a GitLab project with:
  - The container registry enabled
  - A runner that can build images with Docker-in-Docker, which needs privileged mode
  - A runner on the deployment host that can use its Docker daemon

## Configuration

Each environment needs an env file. Start from [.env.staging.example](../.env.staging.example) or [.env.production.example](../.env.production.example).

| Variable | Description |
|---|---|
| `APP_ENV` | `staging` or `production` |
| `APP_HOST` | Hostname or IP address that clients use to reach the app |
| `FRONTEND_PORT` | Port published for the web app |
| `BACKEND_PORT` | Port published for the API. The web app calls this port on the address it was opened from |
| `PAGEWISE_DATA_DIR` | Folder on the host where the database files are stored |
| `POSTGRES_PASSWORD` | Database password |
| `ADMIN_USER` | Admin username |
| `ADMIN_PASS` | Admin password |
| `FRONTEND_IMAGE` | Frontend image to run |
| `BACKEND_IMAGE` | Backend image to run |

Keep these in mind:

- Generate `POSTGRES_PASSWORD` with `openssl rand -hex 32`. Use letters and numbers only, because it becomes part of the database URL.
- If two environments share a host, give each one different ports and a different `PAGEWISE_DATA_DIR`.
- The admin user is updated from `ADMIN_USER` and `ADMIN_PASS` every time the backend starts.
- Never commit a filled-in env file. `.env.staging` and `.env.production` are ignored by git.

## GitLab CI Setup

In your GitLab project, go to **Settings > CI/CD > Variables** and add:

| Variable | Type | Value |
|---|---|---|
| `DEPLOY_RUNNER_TAG` | Variable | Tag of the runner on the deployment host |
| `STAGING_ENV_FILE` | File | Contents of the staging env file |
| `PRODUCTION_ENV_FILE` | File | Contents of the production env file |

The build jobs read `BACKEND_PORT` from these files, so leave their environment scope set to all environments.

If you mark these variables as protected, `dev` and `main` must be protected branches. Otherwise, the jobs can't read them.

After that, every merge into `dev` or `main` deploys automatically. See the [pipeline stages](architecture.md#deployment) for what runs. The backend applies any pending database migrations when it starts.

## Deploying Without CI

To build the images and start an environment directly on the host, create its env file in the repository root and run:

```sh
docker compose -p pagewise-staging --env-file .env.staging -f docker-compose.deploy.yml up -d --build
```

For production, use `pagewise-production` and `.env.production`.

To stop an environment without deleting its data, run:

```sh
docker compose -p pagewise-staging --env-file .env.staging -f docker-compose.deploy.yml down
```

## Database Backups

[scripts/database-backup.sh](../scripts/database-backup.sh) saves a compressed dump of an environment's database and deletes backups in that folder older than 14 days.

```sh
scripts/database-backup.sh <staging|production> <backup folder>
```

Run it on the deployment host as a user that can use Docker. Schedule it daily with your system's task scheduler, and copy the backup folder to a different machine, so a disk failure can't take the database and its backups together.

### Restoring a Backup

⚠️ Restoring replaces the environment's current data, so make a fresh backup first.

```sh
gunzip -c <backup file> | docker exec -i pagewise-<environment>-postgres psql -U pagewise pagewise
```

Test a restore from time to time, ideally on staging. A backup you have never restored isn't proven to work.

## Troubleshooting

| Problem | Likely cause |
|---|---|
| Deploy jobs stay pending | `DEPLOY_RUNNER_TAG` isn't set, or no available runner has that tag |
| The web app loads, but API requests fail | `BACKEND_PORT` changed without rebuilding the frontend image |
| The browser reports a CORS error | The address in the browser doesn't match `APP_HOST` and `FRONTEND_PORT` |
| Compose reports `Set ... in the env file` | A required variable is missing from the env file |
| The backend exits at startup | Check its logs with `docker logs pagewise-<environment>-backend` |
