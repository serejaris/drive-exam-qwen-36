export default function LandingPage() {
  return (
    <main className="min-h-screen px-6 py-12 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">CABA Drive Exam</h1>
      <p className="text-tg-hint mb-6">
        Telegram Mini App для подготовки к теоретическому экзамену на права в Буэнос-Айресе
        (категория B). Модель: <strong>Qwen 3.6</strong>.
      </p>
      <p className="mb-4">
        Откройте бота{' '}
        <a
          className="text-tg-link underline"
          href="https://t.me/qwen_36_ris_bot"
          target="_blank"
          rel="noreferrer"
        >
          @qwen_36_ris_bot
        </a>{' '}
        и нажмите /start.
      </p>
      <p className="text-sm text-tg-hint">
        Это страница-заглушка. Mini App живёт по пути <code>/app</code> и открывается внутри
        Telegram.
      </p>
    </main>
  )
}
