'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useTelegram } from '../telegram-provider'

type MeResponse = {
  ok: true
  user: {
    firstName: string | null
    examQuestionCount: number
  }
} | { ok: false }

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-6 text-tg-hint">Загрузка…</div>}>
      <HomePageInner />
    </Suspense>
  )
}

function HomePageInner() {
  const router = useRouter()
  const search = useSearchParams()
  const { auth } = useTelegram()
  const [me, setMe] = useState<{ firstName: string | null; examQuestionCount: number } | null>(null)
  const [starting, setStarting] = useState<string | null>(null)

  useEffect(() => {
    if (auth.status !== 'authed') return
    fetch('/api/me')
      .then((r) => r.json() as Promise<MeResponse>)
      .then((d) => {
        if (d.ok) setMe(d.user)
      })
  }, [auth.status])

  const startSession = useCallback(
    async (mode: 'practice' | 'exam' | 'mistakes') => {
      setStarting(mode)
      try {
        const res = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ mode }),
        })
        const data = await res.json()
        if (!res.ok || !data.ok) {
          alert(data.error || 'Не удалось стартануть сессию')
          setStarting(null)
          return
        }
        router.push(`/app/session/${data.sessionId}`)
      } catch (e) {
        alert(String(e))
        setStarting(null)
      }
    },
    [router],
  )

  useEffect(() => {
    const deep = search.get('mode')
    if (!deep) return
    if (auth.status !== 'authed') return
    if (deep === 'practice' || deep === 'exam' || deep === 'mistakes') {
      startSession(deep)
    }
  }, [auth.status, search, startSession])

  if (auth.status === 'idle' || auth.status === 'authenticating') {
    return <div className="p-6 text-tg-hint">Загрузка…</div>
  }
  if (auth.status === 'error') {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-3">Откройте внутри Telegram</h1>
        <p className="text-tg-hint">{auth.error}</p>
        <a
          href="https://t.me/qwen_36_ris_bot"
          className="inline-block mt-4 px-4 py-2 rounded-lg bg-tg-button text-tg-buttonText"
        >
          Перейти в бота
        </a>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">
        Привет{me?.firstName ? `, ${me.firstName}` : ''} 🚗
      </h1>
      <p className="text-tg-hint mb-6">Готовься к теоретическому экзамену CABA, категория B.</p>

      <div className="grid gap-3">
        <BigButton
          title="Тренировка"
          subtitle="Фидбек после каждого вопроса"
          disabled={starting !== null}
          onClick={() => startSession('practice')}
        />
        <BigButton
          title={`Экзамен · ${me?.examQuestionCount ?? 40} вопросов`}
          subtitle="Результат только в конце"
          disabled={starting !== null}
          onClick={() => startSession('exam')}
        />
        <BigButton
          title="Повторить ошибки"
          subtitle="Вопросы, где ты ошибался"
          disabled={starting !== null}
          onClick={() => startSession('mistakes')}
        />
        <a
          href="/app/settings"
          className="block text-center px-4 py-3 rounded-xl bg-tg-secondary text-tg-text"
        >
          Настройки
        </a>
      </div>
    </div>
  )
}

function BigButton({
  title,
  subtitle,
  disabled,
  onClick,
}: {
  title: string
  subtitle: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="w-full text-left px-4 py-4 rounded-xl bg-tg-button text-tg-buttonText disabled:opacity-50"
    >
      <div className="font-semibold text-base">{title}</div>
      <div className="text-sm opacity-80">{subtitle}</div>
    </button>
  )
}
