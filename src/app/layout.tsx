import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CABA Drive Exam — Qwen 3.6',
  description:
    'Telegram Mini App для подготовки к теоретическому экзамену на права в Буэнос-Айресе (CABA, категория B). Испанский + русский.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>{children}</body>
    </html>
  )
}
