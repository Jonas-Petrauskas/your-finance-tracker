import { requireUser, type GraphQLContext } from '../../auth.js'
import { prisma } from '../../db.js'
import { monthLabel, validateYearMonth } from '../../lib/dates.js'
import { validateBankBalance } from '../../lib/money.js'
import { requireOwnedMonth } from '../authz.js'
import {
  createNextMonthForUser,
  snapshotKrakenOntoMonth,
  summarizeMonth,
} from './service.js'

export type MonthRow = {
  id: string
  year: number
  month: number
  bankBalanceCents: number
  krakenBalanceCents: number | null
  krakenEarnCents: number | null
  krakenSpotCents: number | null
  krakenSnapshottedAt: Date | null
}

export const monthsResolvers = {
  Month: {
    label: (parent: MonthRow) => monthLabel(parent.year, parent.month),
    krakenSnapshottedAt: (parent: MonthRow) =>
      parent.krakenSnapshottedAt
        ? parent.krakenSnapshottedAt.toISOString()
        : null,
    items: (parent: MonthRow) =>
      prisma.recurringItem.findMany({
        where: { monthId: parent.id },
        orderBy: [{ direction: 'asc' }, { category: 'asc' }, { name: 'asc' }],
      }),
    summary: (parent: MonthRow) => summarizeMonth(parent.id),
  },
  Query: {
    months: (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireUser(ctx)
      return prisma.month.findMany({
        where: { userId: user.id },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      })
    },
    monthByDate: (
      _: unknown,
      { year, month }: { year: number; month: number },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx)
      validateYearMonth(year, month)
      return prisma.month.findUnique({
        where: {
          userId_year_month: { userId: user.id, year, month },
        },
      })
    },
  },
  Mutation: {
    createNextMonth: async (
      _: unknown,
      __: unknown,
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx)
      return createNextMonthForUser(user.id)
    },
    deleteMonth: async (
      _: unknown,
      { id }: { id: string },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx)
      await requireOwnedMonth(user.id, id)
      await prisma.month.delete({ where: { id } })
      return true
    },
    setMonthBankBalance: async (
      _: unknown,
      { monthId, amountCents }: { monthId: string; amountCents: number },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx)
      await requireOwnedMonth(user.id, monthId)
      const value = validateBankBalance(amountCents)
      return prisma.month.update({
        where: { id: monthId },
        data: { bankBalanceCents: value },
      })
    },
    snapshotMonthKraken: async (
      _: unknown,
      { monthId }: { monthId: string },
      ctx: GraphQLContext,
    ) => {
      const user = requireUser(ctx)
      await requireOwnedMonth(user.id, monthId)
      return snapshotKrakenOntoMonth(monthId)
    },
  },
}
