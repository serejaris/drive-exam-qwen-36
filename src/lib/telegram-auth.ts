import { createHmac } from 'node:crypto'

/**
 * Validate Telegram Mini App initData.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * Algorithm:
 *   secret_key = HMAC_SHA256(bot_token, "WebAppData")
 *   data_check_string = sorted k=v pairs (excluding hash) joined by "\n"
 *   expected = hex(HMAC_SHA256(data_check_string, secret_key))
 *   match against `hash` field.
 */
export function validateInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 86400,
): { ok: true; user: TelegramUser; authDate: number } | { ok: false; reason: string } {
  if (!initData) return { ok: false, reason: 'empty initData' }

  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return { ok: false, reason: 'missing hash' }

  params.delete('hash')

  const pairs: string[] = []
  const keys = Array.from(params.keys()).sort()
  for (const k of keys) pairs.push(`${k}=${params.get(k)}`)
  const dataCheckString = pairs.join('\n')

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const expected = createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  if (expected !== hash) return { ok: false, reason: 'bad hash' }

  const authDateRaw = params.get('auth_date')
  const authDate = authDateRaw ? parseInt(authDateRaw, 10) : 0
  const nowSec = Math.floor(Date.now() / 1000)
  if (!authDate || nowSec - authDate > maxAgeSeconds) {
    return { ok: false, reason: 'initData expired' }
  }

  const userRaw = params.get('user')
  if (!userRaw) return { ok: false, reason: 'missing user' }

  let user: TelegramUser
  try {
    user = JSON.parse(userRaw)
  } catch {
    return { ok: false, reason: 'bad user json' }
  }

  if (!user.id) return { ok: false, reason: 'missing user.id' }

  return { ok: true, user, authDate }
}

export interface TelegramUser {
  id: number
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
  is_bot?: boolean
  is_premium?: boolean
}
