# Monthly spending tracker

Local React + GraphQL app for monthly income and expenses. Data stays in SQLite on this machine.

## Stack

- `client/` — Vite, React, TypeScript, Tailwind CSS, Apollo Client
- `server/` — GraphQL Yoga, Prisma, SQLite

## Run

```bash
npm install
npm run db:migrate
npm run dev
```

- App: http://localhost:5173
- GraphiQL: http://localhost:4000/graphql

Use GraphiQL to try the same queries and mutations the UI uses while learning GraphQL.
# your-finance-tracker
