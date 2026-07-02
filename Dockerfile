# ── Stage 1: build frontend static assets ──────────────────────────────────
FROM node:20-bookworm-slim AS frontend-build
WORKDIR /app/frontend
# npm ci can hit npm's "Exit handler never called!" bug under slow/flaky I/O
# (seen on nested-VM Docker hosts with very slow registry throughput) and
# exit 0 with an incomplete install. Disabling the progress bar avoids the
# stdout-pipe race that triggers it, and generous retry/timeout config plus
# a verified-retry loop makes the step tolerant of a slow or flaky network.
RUN npm config set progress false \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-timeout 600000
COPY frontend/package.json frontend/package-lock.json ./
RUN for i in 1 2 3; do \
      rm -rf node_modules \
      && npm ci --no-audit --no-fund \
      && test -f node_modules/.bin/vite \
      && break || echo "npm ci attempt $i failed, retrying..."; \
    done \
    && test -f node_modules/.bin/vite
COPY frontend/ ./
RUN npm run build

# ── Stage 2: install backend production dependencies ───────────────────────
FROM node:20-bookworm-slim AS backend-deps
WORKDIR /app/backend
RUN npm config set progress false \
    && npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-timeout 600000
COPY backend/package.json backend/package-lock.json ./
RUN for i in 1 2 3; do \
      rm -rf node_modules \
      && npm ci --omit=dev --no-audit --no-fund \
      && test -d node_modules/sql.js \
      && break || echo "npm ci attempt $i failed, retrying..."; \
    done \
    && test -d node_modules/sql.js

# ── Stage 3: runtime — nginx (frontend) + node (backend) in one image ──────
FROM node:20-bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=frontend-build /app/frontend/dist /app/frontend
COPY --from=backend-deps /app/backend/node_modules /app/backend/node_modules
COPY backend/server.js backend/app.js backend/db.js backend/analysis.js backend/package.json /app/backend/

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 9080 8090

CMD ["/app/entrypoint.sh"]
