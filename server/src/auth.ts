import { createClerkClient, verifyToken } from '@clerk/backend'
import { GraphQLError } from 'graphql'
import { prisma } from './db.js'

export type AuthUser = {
  id: string
  clerkId: string
  email: string | null
  name: string | null
}

export type GraphQLContext = {
  user: AuthUser | null
}

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY ?? '',
})

export function requireUser(ctx: GraphQLContext): AuthUser {
  if (!ctx.user) {
    throw new GraphQLError('Unauthorized', {
      extensions: { code: 'UNAUTHORIZED' },
    })
  }
  return ctx.user
}

export async function resolveUserFromRequest(
  request: Request,
): Promise<AuthUser | null> {
  if (request.method === 'OPTIONS') return null

  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null

  const token = header.slice('Bearer '.length).trim()
  if (!token) return null

  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) {
    throw new GraphQLError('Server auth is not configured', {
      extensions: { code: 'AUTH_MISCONFIGURED' },
    })
  }

  const payload = await verifyToken(token, { secretKey })
  const clerkId = payload.sub
  if (!clerkId) return null

  const clerkUser = await clerk.users.getUser(clerkId)
  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    null
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
    clerkUser.username ||
    null

  return prisma.user.upsert({
    where: { clerkId },
    create: {
      clerkId,
      email,
      name,
    },
    update: {
      email: email ?? undefined,
      name: name ?? undefined,
    },
  })
}
