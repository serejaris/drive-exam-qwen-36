import { NextRequest, NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const LANG_MODES = ['es_ru', 'es_only', 'ru_only'] as const
type LangMode = (typeof LANG_MODES)[number]

export async function PATCH(req: NextRequest) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as {
    languageMode?: string
    timezone?: string
    examQuestionCount?: number
    reminderEnabled?: boolean
    reminderTimeLocal?: string
    reminderTimezone?: string
  }

  const userUpdate: Record<string, unknown> = {}

  if (body.languageMode && (LANG_MODES as readonly string[]).includes(body.languageMode)) {
    userUpdate.languageMode = body.languageMode as LangMode
  }
  if (typeof body.timezone === 'string' && body.timezone.length > 0) {
    userUpdate.timezone = body.timezone
  }
  if (
    typeof body.examQuestionCount === 'number' &&
    body.examQuestionCount >= 5 &&
    body.examQuestionCount <= 100
  ) {
    userUpdate.examQuestionCount = Math.round(body.examQuestionCount)
  }

  if (Object.keys(userUpdate).length) {
    await prisma.user.update({ where: { id: user.id }, data: userUpdate })
  }

  const reminderData: Record<string, unknown> = {}
  if (typeof body.reminderEnabled === 'boolean') reminderData.enabled = body.reminderEnabled
  if (typeof body.reminderTimeLocal === 'string' && /^\d{2}:\d{2}$/.test(body.reminderTimeLocal)) {
    reminderData.timeLocal = body.reminderTimeLocal
  }
  if (typeof body.reminderTimezone === 'string' && body.reminderTimezone.length > 0) {
    reminderData.timezone = body.reminderTimezone
  }

  if (Object.keys(reminderData).length) {
    await prisma.reminderSettings.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...reminderData },
      update: reminderData,
    })
  }

  return NextResponse.json({ ok: true })
}
