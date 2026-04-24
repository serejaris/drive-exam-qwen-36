import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isAnswerCorrect } from '@/lib/quiz'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const { id } = await ctx.params
  const body = (await req.json().catch(() => ({}))) as {
    question_id?: string
    selected_option_ids?: string[]
  }

  if (!body.question_id || !Array.isArray(body.selected_option_ids)) {
    return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 })
  }

  const session = await prisma.quizSession.findUnique({ where: { id } })
  if (!session || session.userId !== user.id) {
    return NextResponse.json({ ok: false }, { status: 404 })
  }
  if (session.status !== 'active') {
    return NextResponse.json({ ok: false, error: 'session not active' }, { status: 400 })
  }

  const question = await prisma.question.findUnique({
    where: { id: body.question_id },
  })
  if (!question) {
    return NextResponse.json({ ok: false, error: 'question not found' }, { status: 404 })
  }

  const questionIds = (session.questionIds as string[]) || []
  if (!questionIds.includes(question.id)) {
    return NextResponse.json({ ok: false, error: 'question not in session' }, { status: 400 })
  }

  const existing = await prisma.attempt.findFirst({
    where: { sessionId: session.id, questionId: question.id },
  })
  if (existing) {
    return NextResponse.json({
      ok: true,
      alreadyAnswered: true,
      isCorrect: existing.isCorrect,
    })
  }

  const correct = isAnswerCorrect(
    body.selected_option_ids,
    question.correctOptionIds as string[],
  )

  await prisma.$transaction(async (tx) => {
    await tx.attempt.create({
      data: {
        userId: user.id,
        sessionId: session.id,
        questionId: question.id,
        selectedOptionIds: body.selected_option_ids!,
        isCorrect: correct,
      },
    })

    await tx.quizSession.update({
      where: { id: session.id },
      data: {
        score: { increment: correct ? 1 : 0 },
        currentIndex: { increment: 1 },
      },
    })

    const existingStat = await tx.userQuestionStat.findUnique({
      where: { userId_questionId: { userId: user.id, questionId: question.id } },
    })

    const nextStreak = correct ? (existingStat?.correctStreak ?? 0) + 1 : 0
    const nextStatus = correct
      ? nextStreak >= 2
        ? 'mastered'
        : 'learning'
      : 'weak'

    await tx.userQuestionStat.upsert({
      where: { userId_questionId: { userId: user.id, questionId: question.id } },
      create: {
        userId: user.id,
        questionId: question.id,
        attemptsCount: 1,
        correctCount: correct ? 1 : 0,
        wrongCount: correct ? 0 : 1,
        correctStreak: nextStreak,
        lastAnsweredAt: new Date(),
        status: nextStatus,
      },
      update: {
        attemptsCount: { increment: 1 },
        correctCount: { increment: correct ? 1 : 0 },
        wrongCount: { increment: correct ? 0 : 1 },
        correctStreak: nextStreak,
        lastAnsweredAt: new Date(),
        status: nextStatus,
      },
    })
  })

  const showFeedback = session.mode !== 'exam'

  return NextResponse.json({
    ok: true,
    isCorrect: showFeedback ? correct : null,
    correctOptionIds: showFeedback ? question.correctOptionIds : null,
    explanationRu: showFeedback ? question.explanationRu ?? null : null,
  })
}
