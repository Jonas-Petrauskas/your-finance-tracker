import { createServer } from 'node:http'
import { createYoga } from 'graphql-yoga'
import { ensureSettings } from './db.js'
import { schema } from './schema.js'

const PORT = Number(process.env.PORT) || 4000

await ensureSettings()

const yoga = createYoga({
  schema,
  graphqlEndpoint: '/graphql',
})

const server = createServer(yoga)

server.listen(PORT, () => {
  console.log(`GraphQL ready at http://localhost:${PORT}/graphql`)
})
