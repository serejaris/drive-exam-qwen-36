'use client'

import { use, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTelegram } from '../../../telegram-provider'

type SessionMode = 'practice' | 'exam' | 'mistakes'

type Option = { id: string; textEs: string; textRu: string }
type CurrentQuestion = {
  id: string
  category: string
  questionEs: string
  questionRu: string
  media?: { type?: string; url?: string } | null
  explanationRu: string | null
  options: Option[]
}

type SessionResponse =
  | {
      ok: true
      session: {
        id: string
        mode: SessionMode
        status: 'active' | 'completed' | 'abandoned'
        total: number
        score: number
        answered: number
        currentIndex: number
      }
      currentQuestion: CurrentQuestion | null
      lastAttempt: {
        questionId: string
        isCorrect: boolean
        selectedOptionIds: string[]
        correctOptionIds: string[]
        explanationRu: string | null
      } | null
    }
  | { ok: false }

export default function SessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { auth } = useTelegram()

  const [data, setData] = useState<Extract<SessionResponse, { ok: true }> | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean
    correctOptionIds: string[]
    explanationRu: string | null
  } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    const res = await fetch(`/api/sessions/${id}`)
    const json = (await res.json()) as SessionResponse
    if (!json.ok) {
      setError('Сессия не найдена')
      return
    }
    setData(json)
    setSelected([])
    setFeedback(null)
    if (!json.currentQuestion && json.session.status === 'active') {
      // All answered — mark completed and show results.
      await fetch(`/api/sessions/${id}/complete`, { method: 'POST' })
      router.push(`/app/session/${id}/results`)
    } else if (json.session.status === 'completed') {
      router.push(`/app/session/${id}/results`)
    }
  }, [id, router])

  useEffect(() => {
    if (auth.status !== 'authed') return
    reload()
  }, [auth.status, reload])

  async function submit() {
    if (!data?.currentQuestion || selected.length === 0) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/sessions/${id}/answer`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question_id: data.currentQuestion.id,
          selected_option_ids: selected,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        alert(json.error || 'Ошибка')
        return
      }
      if (data.session.mode === 'exam') {
        // No per-question feedback; just advance.
        await reload()
      } else {
        setFeedback({
          isCorrect: json.isCorrect,
          correctOptionIds: json.correctOptionIds || [],
          explanationRu: json.explanationRu,
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function next() {
    await reload()
  }

  if (auth.status !== 'authed') return <div className="p-6 text-tg-hint">Загрузка…</div>
  if (error) {
    return (
      <div className="p-6">
        <p>{error}</p>
        <a href="/app" className="text-tg-link underline">На главную</a>
      </div>
    )
  }
  if (!data) return <div className="p-6 text-tg-hint">Загрузка сессии…</div>

  const { session, currentQuestion } = data
  if (!currentQuestion) return <div className="p-6 text-tg-hint">Все вопросы отвечены…</div>

  const isExam = session.mode === 'exam'
  const disabled = submitting || feedback !== null
  const correctSet = new Set(feedback?.correctOptionIds ?? [])
  const selectedSet = new Set(selected)

  function toggle(optId: string) {
    if (disabled) return
    // MVP: single-choice.
    setSelected([optId])
  }

  return (
    <div className="p-5 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <a href="/app" className="text-tg-link text-sm">← Главная</a>
        <span className="text-sm text-tg-hint">
          {session.answered + (feedback ? 1 : 0) + (isExam ? 0 : 0)} / {session.total}
        </span>
      </div>
      <div className="h-1.5 bg-tg-secondary rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-tg-button transition-all"
          style={{ width: `${Math.round((session.answered / session.total) * 100)}%` }}
        />
      </div>

      {currentQuestion.media && (currentQuestion.media as { url?: string }).url ? (
        <div className="mb-4 rounded-xl overflow-hidden bg-tg-secondary">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={(currentQuestion.media as { url?: string }).url as string}
            alt=""
            className="w-full h-auto block"
          />
        </div>
      ) : null}

      <div className="mb-5">
        <p className="text-lg font-semibold leading-snug">{currentQuestion.questionEs}</p>
        <p className="text-sm text-tg-hint mt-1 leading-snug">{currentQuestion.questionRu}</p>
      </div>

      <ul className="grid gap-2 mb-4">
        {currentQuestion.options.map((o) => {
          const isSelected = selectedSet.has(o.id)
          const isCorrect = correctSet.has(o.id)
          const showCorrect = feedback && isCorrect
          const showWrong = feedback && isSelected && !isCorrect
          const base = 'w-full text-left px-4 py-3 rounded-xl border-2 transition'
          const state = showCorrect
            ? 'border-green-500 bg-green-500/10'
            : showWrong
              ? 'border-red-500 bg-red-500/10'
              : isSelected
                ? 'border-tg-button bg-tg-button/10'
                : 'border-tg-secondary bg-tg-secondary/30'

          return (
            <li key={o.id}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => toggle(o.id)}
                className={`${base} ${state}`}
              >
                <div className="text-base leading-snug">{o.textEs}</div>
                <div className="text-xs text-tg-hint mt-0.5 leading-snug">{o.textRu}</div>
              </button>
            </li>
          )
        })}
      </ul>

      {feedback && (
        <div className="mb-4 p-3 rounded-xl bg-tg-secondary">
          <div className={`text-sm font-semibold ${feedback.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {feedback.isCorrect ? 'Правильно' : 'Неправильно'}
          </div>
          {feedback.explanationRu ? (
            <p className="text-sm mt-1 text-tg-text">{feedback.explanationRu}</p>
          ) : null}
        </div>
      )}

      {!feedback ? (
        <button
          onClick={submit}
          disabled={submitting || selected.length === 0}
          className="w-full px-4 py-3 rounded-xl bg-tg-button text-tg-buttonText disabled:opacity-50 font-semibold"
        >
          {isExam ? 'Ответить' : 'Проверить'}
        </button>
      ) : (
        <button
          onClick={next}
          className="w-full px-4 py-3 rounded-xl bg-tg-button text-tg-buttonText font-semibold"
        >
          Следующий вопрос →
        </button>
      )}
    </div>
  )
}
