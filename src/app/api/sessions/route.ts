import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { defaultLimitForMode, pickQuestionIds } from '@/lib/quiz'
import type { SessionMode } from '@prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as {
    mode?: SessionMode
    limit?: number
  }
  const mode: SessionMode = body.mode && ['practice', 'exam', 'mistakes'].includes(body.mode)
    ? body.mode
    : 'practice'

  const limit = typeof body.limit === 'number' && body.limit > 0
    ? Math.min(Math.round(body.limit), 100)
    : defaultLimitForMode(mode, user.examQuestionCount)

  const ids = await pickQuestionIds(user.id, mode, limit)
  if (ids.length === 0) {
    return NextResponse.json({ ok: false, error: 'no questions available' }, { status: 400 })
  }

  const session = await prisma.quizSession.create({
    data: {
      userId: user.id,
      mode,
      questionIds: ids,
      total: ids.length,
    },
  })

  return NextResponse.json({ ok: true, sessionId: session.id, total: session.total, mode })
}
