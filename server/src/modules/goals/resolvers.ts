import { requireUser, type GraphQLContext } from '../../auth.js'
import { prisma } from '../../db.js'
import { requireOwnedGoal } from '../authz.js'
import { validateGoalInput, type GoalInput } from './validators.js'

export const goalsResolvers = {
  Query: {
    goals: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireUser(ctx)
      return prisma.goal.findMany({
        where: { userId: user.id },
        orderBy: { name: 'asc' },
      })
    },
  },
  Mutation: {
    createGoal: (
      _: unknown,
      { input }: { input: GoalInput },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx)
      const data = validateGoalInput(input)
      return prisma.goal.create({
        data: { ...data, userId: user.id },
      })
    },
    updateGoal: async (
      _: unknown,
      { id, input }: { id: string; input: GoalInput },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx)
      await requireOwnedGoal(user.id, id)
      const data = validateGoalInput(input)
      return prisma.goal.update({ where: { id }, data })
    },
    deleteGoal: async (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx)
      await requireOwnedGoal(user.id, id)
      await prisma.goal.delete({ where: { id } })
      return true
    },
  },
}
