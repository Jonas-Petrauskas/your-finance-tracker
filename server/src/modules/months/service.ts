import { FEATURES } from '../../features.js'
import { getKrakenCryptoBalance } from '../../kraken.js'
import { prisma } from '../../db.js'
import { monthLabel, nextYearMonth } from '../../lib/dates.js'

export async function summarizeMonth(monthId: string) {
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

export async function snapshotKrakenOntoMonth(monthId: string) {
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

export async function createNextMonthForUser(userId: string) {
  const latest = await prisma.month.findFirst({
    where: { userId },
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    include: { items: true },
  })

  if (!latest) {
    const now = new Date()
    return prisma.month.create({
      data: {
        userId,
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
        userId,
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
      userId,
      year: next.year,
      month: next.month,
      bankBalanceCents: latest.bankBalanceCents,
      items: { create: sourceItems },
    },
  })
}
