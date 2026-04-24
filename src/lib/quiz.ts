import { prisma } from './prisma'
import type { SessionMode } from '@prisma/client'

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function pickQuestionIds(
  userId: string,
  mode: SessionMode,
  limit: number,
): Promise<string[]> {
  if (mode === 'mistakes') {
    const wrong = await prisma.attempt.findMany({
      where: { userId, isCorrect: false },
      orderBy: { answeredAt: 'desc' },
      select: { questionId: true },
      take: 200,
    })
    const unique = Array.from(new Set(wrong.map((a) => a.questionId)))
    return shuffle(unique).slice(0, limit)
  }

  const all = await prisma.question.findMany({
    where: { status: 'active' },
    select: { id: true },
  })
  return shuffle(all.map((q) => q.id)).slice(0, limit)
}

export function isAnswerCorrect(
  selected: string[],
  correct: string[],
): boolean {
  if (selected.length !== correct.length) return false
  const sortedS = selected.slice().sort()
  const sortedC = correct.slice().sort()
  return sortedS.every((v, i) => v === sortedC[i])
}

export function defaultLimitForMode(mode: SessionMode, examCount = 40): number {
  if (mode === 'exam') return examCount
  if (mode === 'mistakes') return 20
  return 20
}
