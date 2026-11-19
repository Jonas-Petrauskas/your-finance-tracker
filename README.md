# Monthly spending tracker

Local React + GraphQL app for monthly income and expenses. Data stays in SQLite on this machine.

## Stack

- `client/` — Vite, React, TypeScript, Tailwind CSS, Apollo Client, React Router
- `server/` — GraphQL Yoga, Prisma, SQLite

## Run

```bash
npm install
npm run db:migrate
npm run dev
```

- App: http://localhost:5173 — home lists months; open one for that month’s summary
- GraphiQL: http://localhost:4000/graphql

**Add next month** copies recurring items (and bank savings) from the latest month. Disable any item that does not apply that month — disabled items stay out of the totals.

## Kraken

Put read-only keys in `server/.env` (never commit them):

```
KRAKEN_API_KEY="..."
KRAKEN_API_SECRET="..."
```

The app calls Kraken’s Balance + Earn Allocations APIs on the server. Earn/staked value uses Kraken’s EUR conversion; remaining spot balances are priced with public tickers. The UI shows total = earn + spot. Restart `npm run dev` after changing `.env`.

Use GraphiQL to try the same queries and mutations the UI uses while learning GraphQL.
