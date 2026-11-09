import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export async function ensureSettings() {
  await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1, currency: 'EUR' },
    update: {},
  })
}
