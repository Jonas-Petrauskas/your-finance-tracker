import type { Prisma } from '@prisma/client'
import { requireUser, type GraphQLContext } from '../../auth.js'
import { prisma } from '../../db.js'
import { requireOwnedItem, requireOwnedMonth } from '../authz.js'
import { validateItemInput, type ItemInput } from './validators.js'

export const itemsResolvers = {
  Mutation: {
    createItem: async (
      _: unknown,
      { monthId, input }: { monthId: string; input: ItemInput },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx)
      await requireOwnedMonth(user.id, monthId)
      const data = validateItemInput(input)
      return prisma.recurringItem.create({
        data: {
          ...data,
          monthId,
        } satisfies Prisma.RecurringItemUncheckedCreateInput,
      })
    },
    updateItem: async (
      _: unknown,
      { id, input }: { id: string; input: ItemInput },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx)
      await requireOwnedItem(user.id, id)
      const data = validateItemInput(input)
      return prisma.recurringItem.update({ where: { id }, data })
    },
    deleteItem: async (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx)
      await requireOwnedItem(user.id, id)
      await prisma.recurringItem.delete({ where: { id } })
      return true
    },
    setItemPaid: async (
      _: unknown,
      { id, paid }: { id: string; paid: boolean },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx)
      await requireOwnedItem(user.id, id)
      return prisma.recurringItem.update({
        where: { id },
        data: { paid },
      })
    },
  },
}
