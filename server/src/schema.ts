import { createSchema } from 'graphql-yoga'
import type { Category, Direction, Prisma } from '@prisma/client'
import { prisma } from './db.js'
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
    items: [RecurringItem!]!
    summary: MonthlySummary!
  }

  type Settings {
    currency: String!
  }

  type KrakenBalance {
    balanceCents: Int!
    earnCents: Int!
    spotCents: Int!
    currency: String!
    configured: Boolean!
    error: String
    updatedAt: String!
  }

  input ItemInput {
    name: String!
    amountCents: Int!
    direction: Direction!
    category: Category!
    billingDay: Int
    notes: String
    active: Boolean
  }

  type Query {
    months: [Month!]!
    month(id: ID!): Month
    monthByDate(year: Int!, month: Int!): Month
    settings: Settings!
    krakenBalance: KrakenBalance!
  }

  type Mutation {
    createNextMonth: Month!
    deleteMonth(id: ID!): Boolean!
    createItem(monthId: ID!, input: ItemInput!): RecurringItem!
    updateItem(id: ID!, input: ItemInput!): RecurringItem!
    deleteItem(id: ID!): Boolean!
    setCurrency(currency: String!): Settings!
    setMonthBankBalance(monthId: ID!, amountCents: Int!): Month!
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
}

type MonthRow = {
  id: string
  year: number
  month: number
  bankBalanceCents: number
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

function validateItemInput(input: ItemInput) {
  const name = input.name.trim()
  if (!name) {
    throw new Error('Name is required')
  }
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    throw new Error('Amount must be a positive integer (cents)')
  }
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
    if (item.direction === 'INCOME') {
      incomeCents += item.amountCents
    } else {
      expenseCents += item.amountCents
    }
  }
  return {
    incomeCents,
    expenseCents,
    leftCents: incomeCents - expenseCents,
  }
}

async function ensureSettings() {
  return prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1, currency: 'EUR' },
    update: {},
  })
}

const monthResolvers = {
  label: (parent: MonthRow) => monthLabel(parent.year, parent.month),
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
      months: () =>
        prisma.month.findMany({
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
        }),
      month: (_: unknown, { id }: { id: string }) =>
        prisma.month.findUnique({ where: { id } }),
      monthByDate: (
        _: unknown,
        { year, month }: { year: number; month: number },
      ) => {
        validateYearMonth(year, month)
        return prisma.month.findUnique({
          where: { year_month: { year, month } },
        })
      },
      settings: async () => {
        const settings = await ensureSettings()
        return { currency: settings.currency }
      },
      krakenBalance: () => getKrakenCryptoBalance(),
    },
    Mutation: {
      createNextMonth: async () => {
        const latest = await prisma.month.findFirst({
          orderBy: [{ year: 'desc' }, { month: 'desc' }],
          include: { items: true },
        })

        if (!latest) {
          const now = new Date()
          const year = now.getFullYear()
          const month = now.getMonth() + 1
          return prisma.month.create({
            data: { year, month, bankBalanceCents: 0 },
          })
        }

        const next = nextYearMonth(latest.year, latest.month)
        const existing = await prisma.month.findUnique({
          where: { year_month: next },
        })
        if (existing) {
          throw new Error(`${monthLabel(next.year, next.month)} already exists`)
        }

        return prisma.month.create({
          data: {
            year: next.year,
            month: next.month,
            bankBalanceCents: latest.bankBalanceCents,
            items: {
              create: latest.items.map((item) => ({
                name: item.name,
                amountCents: item.amountCents,
                direction: item.direction,
                category: item.category,
                billingDay: item.billingDay,
                notes: item.notes,
                active: item.active,
              })),
            },
          },
        })
      },
      deleteMonth: async (_: unknown, { id }: { id: string }) => {
        try {
          await prisma.month.delete({ where: { id } })
          return true
        } catch {
          throw new Error('Month not found')
        }
      },
      createItem: async (
        _: unknown,
        { monthId, input }: { monthId: string; input: ItemInput },
      ) => {
        const month = await prisma.month.findUnique({ where: { id: monthId } })
        if (!month) throw new Error('Month not found')
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
      ) => {
        const data = validateItemInput(input)
        try {
          return await prisma.recurringItem.update({ where: { id }, data })
        } catch {
          throw new Error('Item not found')
        }
      },
      deleteItem: async (_: unknown, { id }: { id: string }) => {
        try {
          await prisma.recurringItem.delete({ where: { id } })
          return true
        } catch {
          throw new Error('Item not found')
        }
      },
      setCurrency: async (_: unknown, { currency }: { currency: string }) => {
        const code = validateCurrency(currency)
        const settings = await prisma.settings.upsert({
          where: { id: 1 },
          create: { id: 1, currency: code },
          update: { currency: code },
        })
        return { currency: settings.currency }
      },
      setMonthBankBalance: async (
        _: unknown,
        { monthId, amountCents }: { monthId: string; amountCents: number },
      ) => {
        const value = validateBankBalance(amountCents)
        try {
          return await prisma.month.update({
            where: { id: monthId },
            data: { bankBalanceCents: value },
          })
        } catch {
          throw new Error('Month not found')
        }
      },
    },
  },
})
