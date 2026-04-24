import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const { id } = await ctx.params
  const session = await prisma.quizSession.findUnique({
    where: { id },
    include: { attempts: { orderBy: { answeredAt: 'asc' } } },
  })
  if (!session || session.userId !== user.id) {
    return NextResponse.json({ ok: false }, { status: 404 })
  }

  const questionIds = (session.questionIds as string[]) || []
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    include: { options: { orderBy: { sortOrder: 'asc' } } },
  })
  const byId = new Map(questions.map((q) => [q.id, q]))
  const ordered = questionIds.map((qid) => byId.get(qid)).filter(Boolean)

  const answeredQuestionIds = new Set(session.attempts.map((a) => a.questionId))
  const current = ordered.find((q) => q && !answeredQuestionIds.has(q.id))

  const showFeedback = session.mode !== 'exam'

  return NextResponse.json({
    ok: true,
    session: {
      id: session.id,
      mode: session.mode,
      status: session.status,
      total: session.total,
      score: session.score,
      answered: session.attempts.length,
      currentIndex: session.attempts.length,
      questionIds,
    },
    currentQuestion: current
      ? {
          id: current.id,
          category: current.category,
          questionEs: current.questionEs,
          questionRu: current.questionRu,
          media: current.media,
          explanationRu: showFeedback ? current.explanationRu : null,
          options: current.options.map((o) => ({
            id: o.optionId,
            textEs: o.textEs,
            textRu: o.textRu,
          })),
        }
      : null,
    lastAttempt: showFeedback && session.attempts.length > 0
      ? (() => {
          const a = session.attempts[session.attempts.length - 1]
          const q = byId.get(a.questionId)
          return {
            questionId: a.questionId,
            isCorrect: a.isCorrect,
            selectedOptionIds: a.selectedOptionIds,
            correctOptionIds: q ? q.correctOptionIds : [],
            explanationRu: q?.explanationRu ?? null,
          }
        })()
      : null,
  })
}
