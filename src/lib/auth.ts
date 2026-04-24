import { cookies } from 'next/headers'
import { SESSION_COOKIE, verifySession } from './session-cookie'
import { prisma } from './prisma'

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(SESSION_COOKIE)?.value
  const verified = verifySession(raw)
  return verified?.userId ?? null
}

export async function requireUser() {
  const userId = await getSessionUserId()
  if (!userId) return null
  return prisma.user.findUnique({
    where: { id: userId },
    include: { reminderSettings: true },
  })
}
