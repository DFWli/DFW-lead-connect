# DFW Lead Connect

HVAC lead-conversion SaaS marketing site, with a Next.js (App Router,
TypeScript) backend scaffolded alongside it.

## Project structure

```
public/index.html         Existing static marketing site, served as-is
app/api/                   Backend API routes (Next.js Route Handlers)
app/api/health/            Example route: GET /api/health -> { "status": "ok" }
app/api/leads/             Lead intake: POST/GET /api/leads (see below)
app/api/conversations/start/  Kicks off the AI qualifying text for a lead (see below)
lib/db.ts                  SQLite connection + schema (better-sqlite3)
lib/leads.ts               Lead types and row <-> API mapping
lib/messages.ts             Message types and row <-> API mapping
lib/ai/client.ts            Anthropic client (reads ANTHROPIC_API_KEY)
lib/ai/qualify-lead.ts      Calls Claude to generate the qualifying SMS text
lib/prompts/qualify-lead.ts Prompt text for the qualifying message (edit here, not in lib/ai/)
lib/messaging/send.ts       sendMessage() - sends SMS via Twilio; the one seam to swap providers later
data/leads.db               SQLite database file (gitignored, created on first run)
next.config.ts             Rewrites "/" to public/index.html
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

## AI conversation engine

`POST /api/conversations/start` takes a `leadId`, looks the lead up, asks
Claude to draft a short SMS-style qualifying message for it, sends that
message via Twilio, logs and stores it (`messages` table,
`direction: "outbound"`), and returns it. `lib/messaging/send.ts` is the one
seam for the SMS provider -- swapping Twilio for something else (e.g.
GoHighLevel) only means rewriting `sendMessage()` in that file; nothing else
in the AI or API logic needs to change. A failed SMS send is caught and
logged inside `sendMessage()` -- it never fails the request, so a Twilio
outage doesn't look like a failed lead capture.

### API key setup

```
cp .env.example .env.local
```

Then edit `.env.local`:

- `ANTHROPIC_API_KEY` -- from [console.anthropic.com](https://console.anthropic.com)
  (Settings -> API Keys)
- `TWILIO_ACCOUNT_SID` -- from the [Twilio Console](https://console.twilio.com)
  home page
- `TWILIO_API_KEY_SID`, `TWILIO_API_KEY_SECRET` -- from Account -> API keys
  & tokens -> create a **Restricted** key scoped to Programmable
  Messaging/SMS only (preferred over the account's master Auth Token --
  smaller blast radius if it leaks)
- `TWILIO_PHONE_NUMBER` -- an SMS-capable number purchased in the Twilio
  Console, in E.164 format (e.g. `+18175550100`)

`.env.local` is gitignored and never committed. On Vercel, set the same
four variables under Project Settings -> Environment Variables (Production
scope), then redeploy -- Vercel does not apply new env vars to an
already-built deployment.

### Try it locally

First create a lead (see above), note its `id`, then:

```
curl -X POST http://localhost:3000/api/conversations/start \
  -H "Content-Type: application/json" \
  -d '{ "leadId": 1 }'
```

Response is the stored message record, e.g.:

```json
{
  "id": 1,
  "leadId": 1,
  "direction": "outbound",
  "content": "Hi Sarah, sorry to hear about the AC! ...",
  "createdAt": "2026-08-20T01:02:03.456Z"
}
```

A missing/non-existent `leadId` returns `400`/`404` respectively. A missing
`ANTHROPIC_API_KEY` returns a `500` with a message pointing back at this
setup section instead of a raw stack trace.

This will send a real text message to the lead's phone number via Twilio.
Use your own number when testing locally (create the lead with your own
phone). A missing/invalid Twilio config does not fail the request -- check
the server logs for `[sendMessage]` lines to see whether the SMS actually
sent.
