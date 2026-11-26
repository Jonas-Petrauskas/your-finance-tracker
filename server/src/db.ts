import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export async function ensureSettings(userId: string) {
  return prisma.settings.upsert({
    where: { userId },
    create: { userId, currency: 'EUR' },
    update: {},
  })
}
