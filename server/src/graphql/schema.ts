import { createSchema } from 'graphql-yoga'
import type { GraphQLContext } from '../auth.js'
import { resolvers } from './resolvers.js'
import { typeDefs } from './typeDefs.js'

export const schema = createSchema<GraphQLContext>({
  typeDefs,
  resolvers,
})

