import { requireUser, type GraphQLContext } from '../../auth.js'

export const meResolvers = {
  Query: {
    me: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireUser(ctx)
      return { id: user.id, email: user.email, name: user.name }
    },
  },
}
