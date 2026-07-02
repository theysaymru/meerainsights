# Meera Insights

**Turn Reviews into Ready Actions** — Buildathon MVP by Meesho

Analyze customer feedback, spot repeated issues, and draft seller replies by theme.
No external AI API — all analysis is deterministic, local, evidence-based logic.

---

## Stack

| Layer    | Tech                                       |
|----------|---------------------------------------------|
| Frontend | React 18 + Vite + Tailwind CSS + Recharts   |
| Backend  | Node.js + Express                           |
| Database | SQLite (via `sql.js`, WASM — no native build)|

- Frontend is served on **port 9080** (by nginx in the final image, or Vite dev server locally)
- Backend runs on **port 8090**, reached only through nginx's `/api/` proxy in the final image

---

## Run with Docker (single image — recommended)

The whole app — frontend, backend, and database — ships as **one image**.

```bash
docker build -t meera-insights:final .

# with persistent data across restarts:
mkdir -p data
docker run --rm -p 9080:9080 -p 8090:8090 -v "$(pwd)/data:/app/data" meera-insights:final

# fully standalone (no bind mount, no link to this machine):
docker run --rm -p 9080:9080 -p 8090:8090 meera-insights:final
```

Then open **http://localhost:9080**.

- Frontend → backend traffic always goes through nginx at the relative path `/api/...` — never a
  hardcoded host — so the same image works behind any deployed domain or subdomain.
- Smoke test: `curl http://localhost:9080/api/health` should return `{"status":"ok"}`.
- Data mode: **clean start** — the image ships with an empty database; SQLite initializes fresh
  under `/app/data` on first run.

---

## Run locally without Docker

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Server starts at http://localhost:8090

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App opens at http://localhost:9080 — the Vite dev server proxies `/api` to `http://localhost:8090`,
so the frontend code is identical to what runs in the Docker image.

---

## API Endpoints

| Method | Path                          | Description                     |
|--------|-------------------------------|----------------------------------|
| GET    | /api/health                   | Health check (used by Docker smoke test) |
| POST   | /api/analyze                  | Analyze reviews, store result   |
| GET    | /api/analyses/latest          | Fetch most recent analysis      |
| GET    | /api/analyses/history         | Last 8 analyses (for trend view)|
| GET    | /api/analyses/:id             | Fetch specific analysis         |
| PATCH  | /api/auto-replies/:id/status  | Update reply status             |

---

## Features

- **Meaning-first sentiment analysis** — positive / negative / mixed / neutral, classified by
  real-world outcome rather than emotion keywords alone (e.g. "battery drains quickly" is negative
  even with no negative-sounding words)
- **Automatic product category detection** — clothing, electronics, furniture, kitchen, beauty —
  each with its own domain-specific theme detectors
- **Seller Health Score** (0–100, grade A–F) with category benchmarks
- **Before / After comparison** — paste two batches of reviews and see what improved or worsened
- **WhatsApp Seller Brief** — one-click, ready-to-paste WhatsApp summary of health score, top
  issues, wins, and this week's actions
- **Evidence-based auto-reply drafts** per theme, with copy / mark-ready actions and filter chips
- **Top fixes** — ranked, evidence-based recommendations tagged Fix Now vs Big Fix
- **Trend view** across recent analyses (Recharts line chart)
- **Sentiment donut chart** and **theme frequency bar chart** (Recharts)
- **PDF export** of the full analysis report
- **Shareable analysis links** (`?analysis=ID`)
- **Language switcher**: English, Hindi, Telugu, Marathi, Bengali
- Mobile-first responsive design, toast notifications
- No external AI API — fully deterministic, explainable analysis
