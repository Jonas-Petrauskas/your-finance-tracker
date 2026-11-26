# Monthly spending tracker

React + GraphQL app for monthly income and expenses. Database is **Neon Postgres**. Auth is **Clerk** (Google sign-in).

## Stack

- `client/` — Vite, React, TypeScript, Tailwind CSS, Apollo Client, React Router, Clerk
- `server/` — GraphQL Yoga, Prisma, PostgreSQL (Neon), Clerk token verify

## Setup

1. Copy env examples and fill keys:

   - `server/.env` ← `DATABASE_URL`, `CLERK_SECRET_KEY`
   - `client/.env` ← `VITE_CLERK_PUBLISHABLE_KEY`

2. Install and migrate:

```bash
pnpm install
pnpm db:generate
pnpm db:migrate:deploy
pnpm dev
```

- App: http://localhost:5173 — landing is public; `/months` requires Google sign-in
- GraphQL: http://localhost:4000/graphql (needs `Authorization: Bearer <Clerk session JWT>`)

**Add next month** copies non-one-off items + bank from the latest month (and snapshots Kraken when that feature is enabled). Data is scoped per signed-in user.

## Feature flags

- Client: `client/src/lib/features.ts`
- Server: `server/src/features.ts` (keep in sync)

`FEATURES.kraken` is currently **off**.

## Deploy

### Backend (Render)

- **API:** https://your-finance-tracker.onrender.com/graphql  
- **Build:** `pnpm install --frozen-lockfile && pnpm db:generate && pnpm db:migrate:deploy`
- **Start:** `pnpm start:server`
- **Env:** `DATABASE_URL`, `CLERK_SECRET_KEY`, `CORS_ORIGIN=http://localhost:5173,https://your-finance-tracker.pages.dev`

### Frontend (Cloudflare Pages)

- **App:** https://your-finance-tracker.pages.dev  
- **Build:** `pnpm install --frozen-lockfile && pnpm build:client`
- **Output:** `client/dist`
- **Env:**  
  - `VITE_GRAPHQL_URL=https://your-finance-tracker.onrender.com/graphql`  
  - `VITE_CLERK_PUBLISHABLE_KEY=pk_…`

After changing Pages env vars, **rebuild**. Clerk Production instance is needed for a fully “prod” Google OAuth setup; Development keys work for local + early demos if Clerk allows the Pages origin.

Local notes: `notes/DEMO_DEPLOY_STACK.md` (gitignored).
