# Handoff — Single Image Build

## Status: source fixes complete, image build blocked (no Docker on this machine)

### What was done
- Consolidated the two-container docker-compose setup into ONE root `Dockerfile` (multi-stage:
  frontend build → backend deps → runtime with nginx + node, all on `node:20-bookworm-slim`).
- `frontend/src/App.jsx`: `API_BASE` now defaults to `''` (relative `/api`) instead of a hardcoded
  `http://localhost:8090`, so the same build works behind nginx at any domain.
- `frontend/vite.config.js`: added a dev-server proxy (`/api` → `http://localhost:8090`) so local
  `npm run dev` still works with the new relative API path.
- `backend/server.js`: added `GET /api/health` (returns `{status:"ok"}`), `PORT` now reads from
  `process.env.PORT` (defaults 8090), CORS origin loosened to any `localhost:*` for dev.
- `backend/db.js`: DB path now uses `process.env.DATA_DIR` (defaults to `__dirname` for local dev),
  creates the directory if missing. In the image, `DATA_DIR=/app/data`.
- New root files: `nginx.conf` (proxies `/api/` to `127.0.0.1:8090`, SPA fallback for `/`),
  `entrypoint.sh` (starts backend in background, then nginx in foreground), `.dockerignore`
  (excludes `node_modules`, `*.db`, `data/`, `.git`, old `docker-compose.yml`).
- Deleted the committed `backend/meera_insights.db` so the clean-start image mode has nothing to
  accidentally bake in.

### Data mode: CLEAN START (confirmed with participant)
- No database is copied into the image.
- `entrypoint.sh` calls `mkdir -p /app/data`; `db.js`'s `initDb()` creates the schema fresh on first
  boot since no file exists yet at `/app/data/meera_insights.db`.

### Blocker
Docker is not installed on this machine — checked via `which docker`, `docker --version`, `where.exe docker`
(bash) and `Get-Command docker` (PowerShell); none found. Cannot run
`scripts/build_single_image.sh` or `docker build` here.

### Exact next action (once Docker Desktop is installed)
From the repo root (`C:\Users\Uday Kiran\Desktop\Buildathon`):

```bash
bash "/c/Users/Uday Kiran/.claude/plugins/cache/hackathon-plugins/hackathon-skills/0.1.0/skills/hackathon-single-image-build/scripts/build_single_image.sh" meera-insights:final
```

This builds the image, runs it with the `data/` bind mount, and smoke-tests:
- `http://localhost:9080/` (frontend)
- `http://localhost:9080/api/health` (backend through nginx)

Then confirm the FINAL standalone start (no bind mount, no link to this machine):
```bash
docker run --rm -p 9080:9080 -p 8090:8090 meera-insights:final
```

### Still pending after image build succeeds
- Build source code zip (`hackathon-zip-code`) and upload by hand to organizer's folder.
- Push to `registry.buildathon.ltl.sh/TEAM_ID:TIMESTAMP` (TEAM_ID derived from Meesho email:
  peddula.goud@meesho.com).
- Update README (still describes an old coffee-machine theme; doesn't mention Health Score,
  Before/After Compare, WhatsApp Brief, or the single-image run command).
