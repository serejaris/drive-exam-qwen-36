'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTelegram } from '../../../../telegram-provider'

type Mistake = {
  questionId: string
  questionEs: string
  questionRu: string
  selectedOptionIds: string[]
  correctOptionIds: string[]
  explanationRu: string | null
  options: { id: string; textEs: string; textRu: string }[]
}

type Results = {
  sessionId: string
  mode: 'practice' | 'exam' | 'mistakes'
  total: number
  correct: number
  percentage: number
  passed: boolean
  passThreshold: number
  mistakes: Mistake[]
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { auth } = useTelegram()
  const [results, setResults] = useState<Results | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (auth.status !== 'authed') return
    fetch(`/api/sessions/${id}/complete`, { method: 'POST' })
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) {
          setError('Не удалось загрузить результат')
          return
        }
        setResults(d.results)
      })
      .catch((e) => setError(String(e)))
  }, [auth.status, id])

  async function startMistakes() {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'mistakes' }),
    })
    const d = await res.json()
    if (!res.ok || !d.ok) {
      alert(d.error || 'Нет ошибок для повторения')
      return
    }
    router.push(`/app/session/${d.sessionId}`)
  }

  async function startExam() {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode: 'exam' }),
    })
    const d = await res.json()
    if (!res.ok || !d.ok) {
      alert(d.error || 'Ошибка')
      return
    }
    router.push(`/app/session/${d.sessionId}`)
  }

  if (error) return <div className="p-6">{error}</div>
  if (auth.status !== 'authed' || !results) {
    return <div className="p-6 text-tg-hint">Считаем результат…</div>
  }

  return (
    <div className="p-5 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">Результат</h1>
      <p className="text-tg-hint mb-5">Режим: {modeLabel(results.mode)}</p>

      <div className="p-5 rounded-2xl bg-tg-secondary mb-5">
        <div className="text-4xl font-bold mb-1">
          {results.correct} / {results.total}
        </div>
        <div className={`text-lg font-semibold ${results.passed ? 'text-green-600' : 'text-red-600'}`}>
          {results.percentage}% {results.passed ? '· Сдано' : `· Не сдано (порог ${results.passThreshold}%)`}
        </div>
      </div>

      {results.mistakes.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-semibold mb-3">Ошибки ({results.mistakes.length})</h2>
          <ul className="grid gap-3">
            {results.mistakes.map((m) => {
              const correctOpt = m.options.find((o) => m.correctOptionIds.includes(o.id))
              const selectedOpt = m.options.find((o) => m.selectedOptionIds.includes(o.id))
              return (
                <li key={m.questionId} className="p-3 rounded-xl bg-tg-secondary">
                  <p className="text-sm font-semibold">{m.questionEs}</p>
                  <p className="text-xs text-tg-hint mb-2">{m.questionRu}</p>
                  {selectedOpt && (
                    <p className="text-xs mb-1">
                      <span className="text-red-600">Твой ответ:</span> {selectedOpt.textEs}
                    </p>
                  )}
                  {correctOpt && (
                    <p className="text-xs">
                      <span className="text-green-600">Правильно:</span> {correctOpt.textEs}
                    </p>
                  )}
                  {m.explanationRu && (
                    <p className="text-xs text-tg-hint mt-1">{m.explanationRu}</p>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <div className="grid gap-2">
        {results.mistakes.length > 0 && (
          <button
            onClick={startMistakes}
            className="w-full px-4 py-3 rounded-xl bg-tg-button text-tg-buttonText font-semibold"
          >
            Повторить ошибки
          </button>
        )}
        <button
          onClick={startExam}
          className="w-full px-4 py-3 rounded-xl bg-tg-secondary font-semibold"
        >
          Новый экзамен
        </button>
        <a
          href="/app"
          className="block text-center px-4 py-3 rounded-xl bg-tg-secondary font-semibold"
        >
          На главную
        </a>
      </div>
    </div>
  )
}

function modeLabel(mode: Results['mode']): string {
  switch (mode) {
    case 'exam':
      return 'Экзамен'
    case 'mistakes':
      return 'Повторение ошибок'
    default:
      return 'Тренировка'
  }
}
