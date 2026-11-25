# Monthly spending tracker

React + GraphQL app for monthly income and expenses. Database is **Neon Postgres** (local and hosted).

## Stack

- `client/` — Vite, React, TypeScript, Tailwind CSS, Apollo Client, React Router
- `server/` — GraphQL Yoga, Prisma, PostgreSQL (Neon)

## Setup

1. Copy `server/.env.example` → `server/.env` and set `DATABASE_URL` to your Neon connection string.
2. Install and apply migrations:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate:deploy
pnpm dev
```

- App: http://localhost:5173 — home lists months; open one for that month’s summary
- GraphiQL: http://localhost:4000/graphql

**Add next month** copies non-one-off items + bank from the latest month (and snapshots Kraken when that feature is enabled).

Month page includes: net worth / projected totals, weekly runway, billing calendar (mark paid), goals, recurring + one-off items.

## Feature flags

Toggle product features without deleting code:

- Client: `client/src/lib/features.ts`
- Server: `server/src/features.ts` (keep in sync)

`FEATURES.kraken` is currently **off**. Set both to `true` to restore the Kraken Wealth card, live balance queries, and month snapshots.

## Kraken (when enabled)

Put read-only keys in `server/.env` (never commit them):

```
KRAKEN_API_KEY="..."
KRAKEN_API_SECRET="..."
```

Live Kraken is EUR. Combined totals include Kraken only when Settings currency is EUR. Restart `pnpm dev` after changing `.env` or feature flags.

## Deploy (Phase 0)

### Backend (live)

- **API / GraphiQL:** https://your-finance-tracker.onrender.com/graphql  
- **Service URL:** https://your-finance-tracker.onrender.com  

Free Render sleeps when idle — first request after idle can take ~30–60s.

Render settings (repo root):

- **Build:** `pnpm install --frozen-lockfile && pnpm db:generate && pnpm db:migrate:deploy`
- **Start:** `pnpm start:server`
- **Env:** `DATABASE_URL` (Neon), `CORS_ORIGIN` (comma-separated; include `http://localhost:5173` and your Pages URL)

Do **not** use `corepack enable` on Render (read-only FS error).

### Frontend (live — Cloudflare Pages)

- **App:** https://your-finance-tracker.pages.dev  

Build settings (repo root):

- **Build command:** `pnpm install --frozen-lockfile && pnpm build:client`
- **Build output directory:** `client/dist`
- **Env:** `VITE_GRAPHQL_URL` = `https://your-finance-tracker.onrender.com/graphql`

On Render, set `CORS_ORIGIN` to include the Pages URL, e.g.:

`http://localhost:5173,https://your-finance-tracker.pages.dev`

Locally, leave `VITE_GRAPHQL_URL` unset so the Vite proxy still uses `/graphql`.

Local notes: `notes/DEMO_DEPLOY_STACK.md` (gitignored).

Use GraphiQL to try the same queries and mutations the UI uses while learning GraphQL.
