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
  monthId: string
  name: string
  amountCents: number
  direction: Direction
  category: Category
  billingDay: number | null
  notes: string | null
  active: boolean
  paid: boolean
  oneOff: boolean
}

export type RecurringTemplate = {
  id: string
  name: string
  amountCents: number
  direction: Direction
  category: Category
  billingDay: number | null
  notes: string | null
  active: boolean
}

export type Goal = {
  id: string
  name: string
  targetCents: number
}

export type MonthlySummary = {
  incomeCents: number
  expenseCents: number
  leftCents: number
}

export type Month = {
  id: string
  year: number
  month: number
  label: string
  bankBalanceCents: number
  krakenBalanceCents: number | null
  krakenEarnCents: number | null
  krakenSpotCents: number | null
  krakenSnapshottedAt: string | null
  items: RecurringItem[]
  summary: MonthlySummary
}

export type MonthListItem = {
  id: string
  year: number
  month: number
  label: string
  bankBalanceCents: number
  krakenBalanceCents: number | null
  summary: MonthlySummary
}

export type Settings = {
  currency: string
}

export type KrakenBalance = {
  balanceCents: number
  earnCents: number
  spotCents: number
  currency: string
  configured: boolean
  error: string | null
  updatedAt: string
  cached: boolean
}

export type ItemInput = {
  name: string
  amountCents: number
  direction: Direction
  category: Category
  billingDay?: number | null
  notes?: string | null
  active?: boolean
  paid?: boolean
  oneOff?: boolean
}

export type TemplateInput = {
  name: string
  amountCents: number
  direction: Direction
  category: Category
  billingDay?: number | null
  notes?: string | null
  active?: boolean
}

export type GoalInput = {
  name: string
  targetCents: number
}

export function formatBillingDay(day: number | null | undefined): string | null {
  if (day == null) return null
  if (day === 1 || day === 21 || day === 31) return `${day}st`
  if (day === 2 || day === 22) return `${day}nd`
  if (day === 3 || day === 23) return `${day}rd`
  return `${day}th`
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

export function categoriesForDirection(direction: Direction): Category[] {
  return direction === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

export function defaultDirectionForCategory(category: Category): Direction {
  if (category === 'GOVERNMENT') return 'INCOME'
  if (category === 'OTHER') return 'EXPENSE'
  return 'EXPENSE'
}

export function categoryOrderForItems(
  items: { category: Category }[],
  preferred: Category[],
): Category[] {
  const present = new Set(items.map((item) => item.category))
  const ordered = preferred.filter((category) => present.has(category))
  for (const category of present) {
    if (!ordered.includes(category)) ordered.push(category)
  }
  return ordered
}
