# DFW Lead Connect

HVAC lead-conversion SaaS marketing site, with a Next.js (App Router,
TypeScript) backend scaffolded alongside it.

## Project structure

```
public/index.html   Existing static marketing site, served as-is
app/api/             Backend API routes (Next.js Route Handlers)
app/api/health/      Example route: GET /api/health -> { "status": "ok" }
app/api/leads/       Lead intake: POST/GET /api/leads (see below)
lib/db.ts            SQLite connection + schema (better-sqlite3)
lib/leads.ts         Lead types and row <-> API mapping
data/leads.db         SQLite database file (gitignored, created on first run)
next.config.ts       Rewrites "/" to public/index.html
```

The marketing site at `public/index.html` is unchanged from before this
backend was added. There is no App Router page for `/`, so requests to the
root route fall through to a rewrite in `next.config.ts` that serves
`public/index.html` directly — the static site keeps working exactly as it
did when this repo was plain HTML.

Backend routes live under `app/api/*/route.ts`. Add new endpoints by
creating additional `route.ts` files under `app/api/`.

## Development

```
npm install
npm run dev      # http://localhost:3000
```

## Build

```
npm run build
npm run start
```

## Lead intake API

Leads are stored in a local SQLite database at `data/leads.db` (created
automatically on first run via `better-sqlite3`). This is fine for local
development, but note that **SQLite does not persist on Vercel** —
serverless deployments reset the filesystem on every deploy and cold start.
This endpoint is for proving the API locally; a hosted database (e.g.
Postgres via Vercel/Neon/Supabase) will be needed before it can receive
leads in production.

`leadType` must be one of: `missed_call`, `web_form`, `estimate_followup`,
`reactivation`.

### Create a lead

```
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah T.",
    "phone": "8175550142",
    "source": "web_form",
    "message": "No cool air, 2nd floor",
    "leadType": "web_form"
  }'
```

Missing `phone` or `leadType` returns a `400` with an explanation:

```
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{ "name": "Sarah T." }'
```

### List all leads (newest first)

```
curl http://localhost:3000/api/leads
```
