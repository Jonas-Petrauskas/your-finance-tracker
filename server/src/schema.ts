import { createSchema } from 'graphql-yoga'
import type { Category, Direction, Prisma } from '@prisma/client'
import { requireUser, type GraphQLContext } from './auth.js'
import { ensureSettings, prisma } from './db.js'
import { FEATURES } from './features.js'
import { getKrakenCryptoBalance } from './kraken.js'

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const EXPENSE_ONLY = new Set<Category>(['SUBSCRIPTION', 'RENT', 'BILL', 'BANK'])
const INCOME_ONLY = new Set<Category>(['GOVERNMENT'])

const typeDefs = /* GraphQL */ `
  enum Direction {
    INCOME
    EXPENSE
  }

  enum Category {
    SUBSCRIPTION
    RENT
    BILL
    BANK
    GOVERNMENT
    OTHER
  }

  type RecurringItem {
    id: ID!
    monthId: ID!
    name: String!
    amountCents: Int!
    direction: Direction!
    category: Category!
    billingDay: Int
    notes: String
    active: Boolean!
    paid: Boolean!
    oneOff: Boolean!
  }

  type Goal {
    id: ID!
    name: String!
    targetCents: Int!
  }

  type MonthlySummary {
    incomeCents: Int!
    expenseCents: Int!
    leftCents: Int!
  }

  type Month {
    id: ID!
    year: Int!
    month: Int!
    label: String!
    bankBalanceCents: Int!
    krakenBalanceCents: Int
    krakenEarnCents: Int
    krakenSpotCents: Int
    krakenSnapshottedAt: String
    items: [RecurringItem!]!
    summary: MonthlySummary!
  }

  type Settings {
    currency: String!
  }

  type Me {
    id: ID!
    email: String
    name: String
  }

  type KrakenBalance {
    balanceCents: Int!
    earnCents: Int!
    spotCents: Int!
    currency: String!
    configured: Boolean!
    error: String
    updatedAt: String!
    cached: Boolean!
  }

  input ItemInput {
    name: String!
    amountCents: Int!
    direction: Direction!
    category: Category!
    billingDay: Int
    notes: String
    active: Boolean
    paid: Boolean
    oneOff: Boolean
  }

  input GoalInput {
    name: String!
    targetCents: Int!
  }

  type Query {
    me: Me!
    months: [Month!]!
    monthByDate(year: Int!, month: Int!): Month
    settings: Settings!
    krakenBalance(forceRefresh: Boolean): KrakenBalance!
    goals: [Goal!]!
  }

  type Mutation {
    createNextMonth: Month!
    deleteMonth(id: ID!): Boolean!
    createItem(monthId: ID!, input: ItemInput!): RecurringItem!
    updateItem(id: ID!, input: ItemInput!): RecurringItem!
    deleteItem(id: ID!): Boolean!
    setItemPaid(id: ID!, paid: Boolean!): RecurringItem!
    setCurrency(currency: String!): Settings!
    setMonthBankBalance(monthId: ID!, amountCents: Int!): Month!
    snapshotMonthKraken(monthId: ID!): Month!
    createGoal(input: GoalInput!): Goal!
    updateGoal(id: ID!, input: GoalInput!): Goal!
    deleteGoal(id: ID!): Boolean!
  }
`

type ItemInput = {
  name: string
  amountCents: number
  direction: Direction
  category: Category
  billingDay?: number | null
  notes?: string | null
  active?: boolean | null
  paid?: boolean | null
  oneOff?: boolean | null
}

type GoalInput = {
  name: string
  targetCents: number
}

type MonthRow = {
  id: string
  year: number
  month: number
  bankBalanceCents: number
  krakenBalanceCents: number | null
  krakenEarnCents: number | null
  krakenSpotCents: number | null
  krakenSnapshottedAt: Date | null
}

function monthLabel(year: number, month: number) {
  return `${MONTH_NAMES[month - 1]} ${year}`
}

function nextYearMonth(year: number, month: number) {
  if (month === 12) return { year: year + 1, month: 1 }
  return { year, month: month + 1 }
}

function validateBillingDay(billingDay: number | null | undefined) {
  if (billingDay == null) return null
  if (!Number.isInteger(billingDay) || billingDay < 1 || billingDay > 31) {
    throw new Error('Billing day must be an integer from 1 to 31')
  }
  return billingDay
}

function validateCategoryDirection(category: Category, direction: Direction) {
  if (direction === 'EXPENSE' && INCOME_ONLY.has(category)) {
    throw new Error(`${category} can only be used as income`)
  }
  if (direction === 'INCOME' && EXPENSE_ONLY.has(category)) {
    throw new Error(`${category} can only be used as an expense`)
  }
}

function validateSharedItemFields(input: {
  name: string
  amountCents: number
  direction: Direction
  category: Category
  billingDay?: number | null
  notes?: string | null
  active?: boolean | null
}) {
  const name = input.name.trim()
  if (!name) throw new Error('Name is required')
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error('Amount must be a positive integer (cents)')
  }
  validateCategoryDirection(input.category, input.direction)
  return {
    name,
    amountCents: input.amountCents,
    direction: input.direction,
    category: input.category,
    billingDay: validateBillingDay(input.billingDay),
    notes: input.notes?.trim() ? input.notes.trim() : null,
    active: input.active ?? true,
  }
}

function validateItemInput(input: ItemInput) {
  return {
    ...validateSharedItemFields(input),
    paid: input.paid ?? false,
    oneOff: input.oneOff ?? false,
  }
}

function validateGoalInput(input: GoalInput) {
  const name = input.name.trim()
  if (!name) throw new Error('Name is required')
  if (!Number.isInteger(input.targetCents) || input.targetCents <= 0) {
    throw new Error('Target must be a positive integer (cents)')
  }
  return { name, targetCents: input.targetCents }
}

function validateCurrency(currency: string) {
  const code = currency.trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(code)) {
    throw new Error('Currency must be a 3-letter code (e.g. EUR, PLN)')
  }
  return code
}

function validateBankBalance(amountCents: number) {
  if (!Number.isInteger(amountCents) || amountCents < 0) {
    throw new Error('Bank balance must be an integer >= 0 (cents)')
  }
  return amountCents
}

function validateYearMonth(year: number, month: number) {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error('Year must be between 2000 and 2100')
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error('Month must be an integer from 1 to 12')
  }
}

async function summarizeMonth(monthId: string) {
  const active = await prisma.recurringItem.findMany({
    where: { monthId, active: true },
    select: { amountCents: true, direction: true },
  })
  let incomeCents = 0
  let expenseCents = 0
  for (const item of active) {
    if (item.direction === 'INCOME') incomeCents += item.amountCents
    else expenseCents += item.amountCents
  }
  return {
    incomeCents,
    expenseCents,
    leftCents: incomeCents - expenseCents,
  }
}

async function snapshotKrakenOntoMonth(monthId: string) {
  if (!FEATURES.kraken) {
    return prisma.month.findUniqueOrThrow({ where: { id: monthId } })
  }
  const live = await getKrakenCryptoBalance({ forceRefresh: true })
  if (live.error || !live.configured) {
    return prisma.month.findUniqueOrThrow({ where: { id: monthId } })
  }
  return prisma.month.update({
    where: { id: monthId },
    data: {
      krakenBalanceCents: live.balanceCents,
      krakenEarnCents: live.earnCents,
      krakenSpotCents: live.spotCents,
      krakenSnapshottedAt: new Date(),
    },
  })
}

async function requireOwnedMonth(userId: string, monthId: string) {
  const month = await prisma.month.findFirst({
    where: { id: monthId, userId },
  })
  if (!month) throw new Error('Month not found')
  return month
}

async function requireOwnedItem(userId: string, itemId: string) {
  const item = await prisma.recurringItem.findFirst({
    where: { id: itemId, month: { userId } },
  })
  if (!item) throw new Error('Item not found')
  return item
}

async function requireOwnedGoal(userId: string, goalId: string) {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
  })
  if (!goal) throw new Error('Goal not found')
  return goal
}

const monthResolvers = {
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
}

export const schema = createSchema({
  typeDefs,
  resolvers: {
    Month: monthResolvers,
    Query: {
      me: (_: unknown, __: unknown, ctx: GraphQLContext) => {
        const user = requireUser(ctx)
        return { id: user.id, email: user.email, name: user.name }
      },
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
      settings: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
        const user = requireUser(ctx)
        const settings = await ensureSettings(user.id)
        return { currency: settings.currency }
      },
      krakenBalance: (
        _: unknown,
        { forceRefresh }: { forceRefresh?: boolean | null },
        ctx: GraphQLContext,
      ) => {
        requireUser(ctx)
        return getKrakenCryptoBalance({ forceRefresh: forceRefresh === true })
      },
      goals: (_: unknown, __: unknown, ctx: GraphQLContext) => {
        const user = requireUser(ctx)
        return prisma.goal.findMany({
          where: { userId: user.id },
          orderBy: { name: 'asc' },
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
        const latest = await prisma.month.findFirst({
          where: { userId: user.id },
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          include: { items: true },
        })

        if (!latest) {
          const now = new Date()
          return prisma.month.create({
            data: {
              userId: user.id,
              year: now.getFullYear(),
              month: now.getMonth() + 1,
              bankBalanceCents: 0,
            },
          })
        }

        const next = nextYearMonth(latest.year, latest.month)
        const existing = await prisma.month.findUnique({
          where: {
            userId_year_month: {
              userId: user.id,
              year: next.year,
              month: next.month,
            },
          },
        })
        if (existing) {
          throw new Error(`${monthLabel(next.year, next.month)} already exists`)
        }

        if (FEATURES.kraken && latest.krakenSnapshottedAt == null) {
          await snapshotKrakenOntoMonth(latest.id)
        }

        const sourceItems = latest.items
          .filter((item) => !item.oneOff)
          .map((item) => ({
            name: item.name,
            amountCents: item.amountCents,
            direction: item.direction,
            category: item.category,
            billingDay: item.billingDay,
            notes: item.notes,
            active: item.active,
            paid: false,
            oneOff: false,
          }))

        return prisma.month.create({
          data: {
            userId: user.id,
            year: next.year,
            month: next.month,
            bankBalanceCents: latest.bankBalanceCents,
            items: { create: sourceItems },
          },
        })
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
  },
})
