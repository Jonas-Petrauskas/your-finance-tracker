import type { RecurringItem } from './types'

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function clampBillingDay(
  day: number,
  year: number,
  month: number,
): number {
  return Math.min(day, daysInMonth(year, month))
}

export type RunwayStats = {
  daysRemaining: number
  daysInMonth: number
  dailyBudgetCents: number
  weeklyBudgetCents: number
  unpaidExpenseCents: number
}

export function computeRunway(
  year: number,
  month: number,
  leftCents: number,
  items: RecurringItem[],
  today = new Date(),
): RunwayStats {
  const totalDays = daysInMonth(year, month)
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month
  const dayOfMonth = isCurrentMonth ? today.getDate() : 1
  const daysRemaining = Math.max(1, totalDays - dayOfMonth + 1)

  const unpaidExpenseCents = items
    .filter(
      (item) =>
        item.direction === 'EXPENSE' && item.active && !item.paid,
    )
    .reduce((sum, item) => sum + item.amountCents, 0)

  const dailyBudgetCents = Math.floor(leftCents / daysRemaining)

  return {
    daysRemaining,
    daysInMonth: totalDays,
    dailyBudgetCents,
    weeklyBudgetCents: dailyBudgetCents * 7,
    unpaidExpenseCents,
  }
}

export type BillingCalendarEntry = {
  day: number
  items: RecurringItem[]
}

export function buildBillingCalendar(
  year: number,
  month: number,
  items: RecurringItem[],
): BillingCalendarEntry[] {
  const byDay = new Map<number, RecurringItem[]>()
  for (const item of items) {
    if (!item.active || item.billingDay == null) continue
    const day = clampBillingDay(item.billingDay, year, month)
    const list = byDay.get(day) ?? []
    list.push(item)
    byDay.set(day, list)
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([day, dayItems]) => ({
      day,
      items: dayItems.sort((a, b) => a.name.localeCompare(b.name)),
    }))
}
