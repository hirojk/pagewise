# Build from the repository root: docker build -f apps/frontend/Dockerfile --build-arg API_PORT=5000 .
FROM node:26-slim AS build
ARG API_PORT
RUN test -n "$API_PORT" || { echo 'ERROR: The API_PORT build argument is required.'; exit 1; }
RUN npm install --global pnpm@11.7.0
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json apps/frontend/
COPY packages/shared/package.json packages/shared/
RUN pnpm install --frozen-lockfile --filter @pagewise/frontend...

COPY apps/frontend apps/frontend
COPY packages/shared packages/shared

ENV EXPO_PUBLIC_API_PORT=$API_PORT EXPO_NO_TELEMETRY=1
RUN pnpm --filter @pagewise/shared build && pnpm --filter @pagewise/frontend build

FROM nginx:1.29-alpine
ARG NGINX_CONF=nginx.conf
COPY apps/frontend/${NGINX_CONF} apps/frontend/nginx.conf htpasswd* /tmp/nginx/
RUN mv /tmp/nginx/${NGINX_CONF} /etc/nginx/conf.d/default.conf \
  && if [ -f /tmp/nginx/htpasswd ]; then install -m 644 /tmp/nginx/htpasswd /etc/nginx/htpasswd; fi \
  && rm -rf /tmp/nginx
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
