export type Direction = 'INCOME' | 'EXPENSE'
export type Category =
  | 'SUBSCRIPTION'
  | 'RENT'
  | 'BILL'
  | 'BANK'
  | 'GOVERNMENT'
  | 'OTHER'

export type RecurringItem = {
  id: string
  name: string
  amountCents: number
  direction: Direction
  category: Category
  notes: string | null
  active: boolean
}

export type MonthlySummary = {
  incomeCents: number
  expenseCents: number
  leftCents: number
}

export type Settings = {
  currency: string
  bankBalanceCents: number
}

export type ItemInput = {
  name: string
  amountCents: number
  direction: Direction
  category: Category
  notes?: string | null
  active?: boolean
}

export const CATEGORY_LABELS: Record<Category, string> = {
  SUBSCRIPTION: 'Subscriptions',
  RENT: 'Rent',
  BILL: 'Bills',
  BANK: 'Bank',
  GOVERNMENT: 'Government',
  OTHER: 'Other',
}

export const EXPENSE_CATEGORIES: Category[] = [
  'SUBSCRIPTION',
  'RENT',
  'BILL',
  'BANK',
  'OTHER',
]

export const INCOME_CATEGORIES: Category[] = ['GOVERNMENT', 'OTHER']

export function defaultDirectionForCategory(category: Category): Direction {
  if (category === 'GOVERNMENT') return 'INCOME'
  if (category === 'OTHER') return 'EXPENSE'
  return 'EXPENSE'
}
