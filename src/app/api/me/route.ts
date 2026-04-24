import { NextResponse } from 'next/server'
import { requireUser } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  return NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      firstName: user.firstName,
      username: user.username,
      languageMode: user.languageMode,
      timezone: user.timezone,
      examQuestionCount: user.examQuestionCount,
      reminder: user.reminderSettings
        ? {
            enabled: user.reminderSettings.enabled,
            timeLocal: user.reminderSettings.timeLocal,
            timezone: user.reminderSettings.timezone,
          }
        : null,
    },
  })
}
