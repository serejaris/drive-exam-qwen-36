import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'
import { getBot, mainMenuKeyboard } from '@/lib/bot'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

function timeMatches(nowUtc: Date, reminderLocal: string, tz: string, toleranceMin = 5): boolean {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    })
    const parts = fmt.formatToParts(nowUtc)
    const hour = parts.find((p) => p.type === 'hour')?.value ?? '00'
    const minute = parts.find((p) => p.type === 'minute')?.value ?? '00'
    const nowLocalMin = parseInt(hour, 10) * 60 + parseInt(minute, 10)

    const [rh, rm] = reminderLocal.split(':').map((n) => parseInt(n, 10))
    const targetMin = rh * 60 + rm
    const diff = Math.abs(nowLocalMin - targetMin)
    return diff <= toleranceMin || diff >= 1440 - toleranceMin
  } catch {
    return false
  }
}

function authorize(req: NextRequest): boolean {
  const auth = req.headers.get('authorization') || ''
  const header = req.headers.get('x-cron-secret') || ''
  const qp = req.nextUrl.searchParams.get('secret') || ''
  return (
    auth === `Bearer ${env.CRON_SECRET}` || header === env.CRON_SECRET || qp === env.CRON_SECRET
  )
}

async function handle(req: NextRequest) {
  if (!authorize(req)) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  const now = new Date()
  const candidates = await prisma.reminderSettings.findMany({
    where: { enabled: true },
    include: { user: true },
  })

  let sent = 0
  let skipped = 0
  let failed = 0
  const bot = getBot()

  for (const r of candidates) {
    if (!timeMatches(now, r.timeLocal, r.timezone)) {
      skipped++
      continue
    }
    // Avoid double-send within 23h.
    if (r.lastSentAt && now.getTime() - r.lastSentAt.getTime() < 23 * 60 * 60 * 1000) {
      skipped++
      continue
    }
    try {
      await bot.api.sendMessage(
        Number(r.user.chatId),
        [
          'Пора потренироваться 🚗',
          'Сегодня цель: 20 вопросов или 1 тестовый экзамен.',
        ].join('\n'),
        { reply_markup: mainMenuKeyboard() },
      )
      await prisma.reminderSettings.update({
        where: { userId: r.userId },
        data: { lastSentAt: now },
      })
      sent++
    } catch (e) {
      console.error('[cron] send failed', r.userId, e)
      failed++
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, failed, candidates: candidates.length })
}

export async function GET(req: NextRequest) {
  return handle(req)
}

export async function POST(req: NextRequest) {
  return handle(req)
}
