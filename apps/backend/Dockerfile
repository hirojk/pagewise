# Build from the repository root: docker build -f apps/backend/Dockerfile .
FROM node:26-slim AS build
RUN npm install --global pnpm@11.7.0
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --filter @pagewise/backend...

COPY apps/backend apps/backend
COPY packages/shared packages/shared
RUN pnpm --filter @pagewise/shared build && pnpm --filter @pagewise/backend build

# Copies the backend with production dependencies only, without the rest of the monorepo.
RUN pnpm --filter @pagewise/backend --prod --legacy deploy /prod

FROM node:26-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /prod ./
USER node
EXPOSE 5000
CMD ["node", "dist/server.js"]
