import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PASS_PERCENT = 85

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const { id } = await ctx.params
  const session = await prisma.quizSession.findUnique({
    where: { id },
    include: {
      attempts: {
        include: {
          question: { include: { options: { orderBy: { sortOrder: 'asc' } } } },
        },
      },
    },
  })
  if (!session || session.userId !== user.id) {
    return NextResponse.json({ ok: false }, { status: 404 })
  }

  if (session.status === 'active') {
    await prisma.quizSession.update({
      where: { id: session.id },
      data: { status: 'completed', completedAt: new Date() },
    })
  }

  const total = session.total
  const correct = session.attempts.filter((a) => a.isCorrect).length
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0

  const mistakes = session.attempts
    .filter((a) => !a.isCorrect)
    .map((a) => ({
      questionId: a.questionId,
      questionEs: a.question.questionEs,
      questionRu: a.question.questionRu,
      selectedOptionIds: a.selectedOptionIds,
      correctOptionIds: a.question.correctOptionIds,
      explanationRu: a.question.explanationRu,
      options: a.question.options.map((o) => ({
        id: o.optionId,
        textEs: o.textEs,
        textRu: o.textRu,
      })),
    }))

  return NextResponse.json({
    ok: true,
    results: {
      sessionId: session.id,
      mode: session.mode,
      total,
      correct,
      percentage,
      passed: percentage >= PASS_PERCENT,
      passThreshold: PASS_PERCENT,
      mistakes,
    },
  })
}
