import type { Metadata } from 'next'
import TelegramProvider from './telegram-provider'

export const metadata: Metadata = {
  title: 'CABA Drive Exam',
  robots: 'noindex',
}

export default function MiniAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TelegramProvider>
      <div className="min-h-screen bg-tg-bg text-tg-text">{children}</div>
    </TelegramProvider>
  )
}
