import { createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'qwen36_sid'
const SESSION_TTL_SEC = 60 * 60 * 24 * 30 // 30 days

/**
 * Simple signed cookie with HMAC, signed by BOT_WEBHOOK_SECRET.
 * Payload format: base64url(json) + "." + hex(hmac)
 */
function secret(): string {
  return process.env.BOT_WEBHOOK_SECRET || 'dev-secret'
}

export function signSession(payload: { userId: string; exp: number }): string {
  const json = JSON.stringify(payload)
  const body = Buffer.from(json).toString('base64url')
  const sig = createHmac('sha256', secret()).update(body).digest('hex')
  return `${body}.${sig}`
}

export function verifySession(raw: string | undefined | null): { userId: string } | null {
  if (!raw) return null
  const [body, sig] = raw.split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', secret()).update(body).digest('hex')
  const a = Buffer.from(sig, 'hex')
  const b = Buffer.from(expected, 'hex')
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      userId: string
      exp: number
    }
    if (!parsed.userId || !parsed.exp) return null
    if (parsed.exp < Math.floor(Date.now() / 1000)) return null
    return { userId: parsed.userId }
  } catch {
    return null
  }
}

export function makeSession(userId: string): string {
  return signSession({ userId, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SEC })
}
