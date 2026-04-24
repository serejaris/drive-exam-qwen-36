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
  const q = await prisma.question.findUnique({
    where: { id },
    include: { options: { orderBy: { sortOrder: 'asc' } } },
  })
  if (!q) return NextResponse.json({ ok: false }, { status: 404 })

  return NextResponse.json({
    ok: true,
    question: {
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
    },
  })
}
