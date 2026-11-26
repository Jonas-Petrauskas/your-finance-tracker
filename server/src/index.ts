import { createServer } from 'node:http'
import { createYoga } from 'graphql-yoga'
import { resolveUserFromRequest, type GraphQLContext } from './auth.js'
import { schema } from './schema.js'

const PORT = Number(process.env.PORT) || 4000

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [
      'http://localhost:5173',
      'https://your-finance-tracker.pages.dev',
    ]

const yoga = createYoga<GraphQLContext>({
  schema,
  graphqlEndpoint: '/graphql',
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
  context: async ({ request }) => {
    try {
      const user = await resolveUserFromRequest(request)
      return { user }
    } catch (error) {
      console.error('Auth error', error)
      return { user: null }
    }
  },
})

const server = createServer(yoga)

server.listen(PORT, '0.0.0.0', () => {
  console.log(`GraphQL ready at http://localhost:${PORT}/graphql`)
})
