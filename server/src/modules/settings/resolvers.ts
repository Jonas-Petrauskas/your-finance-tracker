import { requireUser, type GraphQLContext } from '../../auth.js'
import { ensureSettings, prisma } from '../../db.js'
import { validateCurrency } from '../../lib/money.js'

export const settingsResolvers = {
  Query: {
    settings: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireUser(ctx)
      const settings = await ensureSettings(user.id)
      return { currency: settings.currency }
    },
  },
  Mutation: {
    setCurrency: async (
      _: unknown,
      { currency }: { currency: string },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx)
      const code = validateCurrency(currency)
      const settings = await prisma.settings.upsert({
        where: { userId: user.id },
        create: { userId: user.id, currency: code },
        update: { currency: code },
      })
      return { currency: settings.currency }
    },
  },
}
