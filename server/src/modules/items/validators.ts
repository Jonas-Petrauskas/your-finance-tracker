import type { Category, Direction } from '@prisma/client'

const EXPENSE_ONLY = new Set<Category>(['SUBSCRIPTION', 'RENT', 'BILL', 'BANK'])
const INCOME_ONLY = new Set<Category>(['GOVERNMENT'])

export type ItemInput = {
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

export function validateItemInput(input: ItemInput) {
  return {
    ...validateSharedItemFields(input),
    paid: input.paid ?? false,
    oneOff: input.oneOff ?? false,
  }
}
