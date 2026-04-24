import { NextRequest, NextResponse } from 'next/server'
import { validateInitData } from '@/lib/telegram-auth'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'
import { SESSION_COOKIE, makeSession } from '@/lib/session-cookie'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let body: { initData?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad body' }, { status: 400 })
  }

  const initData = body.initData || ''
  const result = validateInitData(initData, env.TELEGRAM_BOT_TOKEN)
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.reason }, { status: 401 })
  }

  const tgUser = result.user

  const user = await prisma.user.upsert({
    where: { telegramUserId: BigInt(tgUser.id) },
    create: {
      telegramUserId: BigInt(tgUser.id),
      chatId: BigInt(tgUser.id),
      username: tgUser.username,
      firstName: tgUser.first_name,
      reminderSettings: { create: {} },
    },
    update: {
      username: tgUser.username,
      firstName: tgUser.first_name,
      lastSeenAt: new Date(),
    },
    include: { reminderSettings: true },
  })

  const res = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      firstName: user.firstName,
      username: user.username,
      languageMode: user.languageMode,
      timezone: user.timezone,
      examQuestionCount: user.examQuestionCount,
    },
  })
  res.cookies.set(SESSION_COOKIE, makeSession(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
