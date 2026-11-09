import { createSchema } from 'graphql-yoga'
import type { Category, Direction, Prisma } from '@prisma/client'
import { prisma } from './db.js'

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
    name: String!
    amountCents: Int!
    direction: Direction!
    category: Category!
    notes: String
    active: Boolean!
  }

  type MonthlySummary {
    incomeCents: Int!
    expenseCents: Int!
    leftCents: Int!
  }

  type Settings {
    currency: String!
    bankBalanceCents: Int!
  }

  input ItemInput {
    name: String!
    amountCents: Int!
    direction: Direction!
    category: Category!
    notes: String
    active: Boolean
  }

  type Query {
    items: [RecurringItem!]!
    monthlySummary: MonthlySummary!
    settings: Settings!
  }

  type Mutation {
    createItem(input: ItemInput!): RecurringItem!
    updateItem(id: ID!, input: ItemInput!): RecurringItem!
    deleteItem(id: ID!): Boolean!
    setCurrency(currency: String!): Settings!
    setBankBalance(amountCents: Int!): Settings!
  }
`

type ItemInput = {
  name: string
  amountCents: number
  direction: Direction
  category: Category
  notes?: string | null
  active?: boolean | null
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
    notes: input.notes?.trim() ? input.notes.trim() : null,
    active: input.active ?? true,
  } satisfies Prisma.RecurringItemCreateInput
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

export const schema = createSchema({
  typeDefs,
  resolvers: {
    Query: {
      items: () =>
        prisma.recurringItem.findMany({
          orderBy: [{ direction: 'asc' }, { category: 'asc' }, { name: 'asc' }],
        }),
      monthlySummary: async () => {
        const active = await prisma.recurringItem.findMany({
          where: { active: true },
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
      },
      settings: async () => {
        const settings = await prisma.settings.findUniqueOrThrow({
          where: { id: 1 },
        })
        return {
          currency: settings.currency,
          bankBalanceCents: settings.bankBalanceCents,
        }
      },
    },
    Mutation: {
      createItem: (_: unknown, { input }: { input: ItemInput }) => {
        const data = validateItemInput(input)
        return prisma.recurringItem.create({ data })
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
        return {
          currency: settings.currency,
          bankBalanceCents: settings.bankBalanceCents,
        }
      },
      setBankBalance: async (_: unknown, { amountCents }: { amountCents: number }) => {
        const value = validateBankBalance(amountCents)
        const settings = await prisma.settings.upsert({
          where: { id: 1 },
          create: { id: 1, currency: 'EUR', bankBalanceCents: value },
          update: { bankBalanceCents: value },
        })
        return {
          currency: settings.currency,
          bankBalanceCents: settings.bankBalanceCents,
        }
      },
    },
  },
})
