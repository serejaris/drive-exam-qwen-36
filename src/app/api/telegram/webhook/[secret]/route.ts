import { NextRequest, NextResponse } from 'next/server'
import { webhookCallback } from 'grammy'
import { getBot } from '@/lib/bot'
import { env } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ secret: string }> },
) {
  const { secret } = await ctx.params
  if (secret !== env.BOT_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 })
  }

  const handler = webhookCallback(getBot(), 'std/http')
  return handler(req)
}
