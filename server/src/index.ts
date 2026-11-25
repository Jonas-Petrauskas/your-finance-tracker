import { createServer } from 'node:http'
import { createYoga } from 'graphql-yoga'
import { ensureSettings } from './db.js'
import { schema } from './schema.js'

const PORT = Number(process.env.PORT) || 4000

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [
      'http://localhost:5173',
      'https://your-finance-tracker.pages.dev',
    ]

await ensureSettings()

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
})

const server = createServer(yoga)

server.listen(PORT, '0.0.0.0', () => {
  console.log(`GraphQL ready at http://localhost:${PORT}/graphql`)
})
