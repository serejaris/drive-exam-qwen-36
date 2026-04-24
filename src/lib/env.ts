function required(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env var: ${name}`)
  return v
}

function optional(name: string, fallback = ''): string {
  return process.env[name] ?? fallback
}

export const env = {
  get TELEGRAM_BOT_TOKEN() {
    return required('TELEGRAM_BOT_TOKEN')
  },
  get TELEGRAM_BOT_USERNAME() {
    return required('TELEGRAM_BOT_USERNAME')
  },
  get WEBAPP_URL() {
    return required('WEBAPP_URL')
  },
  get BOT_WEBHOOK_SECRET() {
    return required('BOT_WEBHOOK_SECRET')
  },
  get CRON_SECRET() {
    return required('CRON_SECRET')
  },
  get APP_TIMEZONE() {
    return optional('APP_TIMEZONE', 'America/Argentina/Buenos_Aires')
  },
}
