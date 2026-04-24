import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const limit = Math.min(
    Math.max(parseInt(req.nextUrl.searchParams.get('limit') || '20', 10) || 20, 1),
    100,
  )

  const rows = await prisma.question.findMany({
    where: { status: 'active' },
    take: limit,
    include: { options: { orderBy: { sortOrder: 'asc' } } },
  })

  return NextResponse.json({
    ok: true,
    questions: rows.map((q) => ({
      id: q.id,
      category: q.category,
      questionEs: q.questionEs,
      questionRu: q.questionRu,
      media: q.media,
      options: q.options.map((o) => ({
        id: o.optionId,
        textEs: o.textEs,
        textRu: o.textRu,
      })),
    })),
  })
}
