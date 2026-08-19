# DFW Lead Connect

HVAC lead-conversion SaaS marketing site, with a Next.js (App Router,
TypeScript) backend scaffolded alongside it.

## Project structure

```
public/index.html   Existing static marketing site, served as-is
app/api/             Backend API routes (Next.js Route Handlers)
app/api/health/      Example route: GET /api/health -> { "status": "ok" }
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
