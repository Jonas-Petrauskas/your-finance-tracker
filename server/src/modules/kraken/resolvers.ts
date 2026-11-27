import { requireUser, type GraphQLContext } from '../../auth.js'
import { getKrakenCryptoBalance } from '../../kraken.js'

export const krakenResolvers = {
  Query: {
    krakenBalance: (
      _: unknown,
      { forceRefresh }: { forceRefresh?: boolean | null },
      ctx: GraphQLContext,
    ) => {
      requireUser(ctx)
      return getKrakenCryptoBalance({ forceRefresh: forceRefresh === true })
    },
  },
}
