# Monthly spending tracker

Local React + GraphQL app for monthly income and expenses. Data stays in SQLite on this machine.

## Stack

- `client/` — Vite, React, TypeScript, Tailwind CSS, Apollo Client, React Router
- `server/` — GraphQL Yoga, Prisma, SQLite

## Run

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

- App: http://localhost:5173 — home lists months; open one for that month’s summary
- GraphiQL: http://localhost:4000/graphql

**Add next month** copies non-one-off items + bank from the latest month, and snapshots Kraken onto the month you leave behind.

Month page includes: net worth / projected totals, weekly runway, billing calendar (mark paid), goals, recurring + one-off items.

## Kraken

Put read-only keys in `server/.env` (never commit them):

```
KRAKEN_API_KEY="..."
KRAKEN_API_SECRET="..."
```

Live Kraken is EUR. Combined totals include Kraken only when Settings currency is EUR. Restart `pnpm dev` after changing `.env`.

Use GraphiQL to try the same queries and mutations the UI uses while learning GraphQL.
