/**
 * Usage:
 *   WEBAPP_URL=https://... BOT_WEBHOOK_SECRET=... TELEGRAM_BOT_TOKEN=... npm run bot:setwebhook
 *
 * Loads .env if present.
 */
import 'node:fs'
import { config as loadEnv } from 'node:process'

try {
  const fs = await import('node:fs/promises')
  const raw = await fs.readFile('.env', 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
  }
} catch {
  // no .env, that's fine
}

const token = process.env.TELEGRAM_BOT_TOKEN
const base = process.env.WEBAPP_URL
const secret = process.env.BOT_WEBHOOK_SECRET

if (!token || !base || !secret) {
  console.error('Need TELEGRAM_BOT_TOKEN, WEBAPP_URL, BOT_WEBHOOK_SECRET in env.')
  process.exit(1)
}

const url = `${base.replace(/\/$/, '')}/api/telegram/webhook/${secret}`

const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({
    url,
    drop_pending_updates: true,
    allowed_updates: ['message', 'callback_query'],
  }),
})
const data = await res.json()
console.log('setWebhook →', data)
