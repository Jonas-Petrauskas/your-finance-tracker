import { prisma } from '../db.js'

export async function requireOwnedMonth(userId: string, monthId: string) {
  const month = await prisma.month.findFirst({
    where: { id: monthId, userId },
  })
  if (!month) throw new Error('Month not found')
  return month
}

export async function requireOwnedItem(userId: string, itemId: string) {
  const item = await prisma.recurringItem.findFirst({
    where: { id: itemId, month: { userId } },
  })
  if (!item) throw new Error('Item not found')
  return item
}

export async function requireOwnedGoal(userId: string, goalId: string) {
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
  })
  if (!goal) throw new Error('Goal not found')
  return goal
}
