'use client'

import { useEffect, useState } from 'react'
import { useTelegram } from '../../telegram-provider'

type Settings = {
  languageMode: 'es_ru' | 'es_only' | 'ru_only'
  timezone: string
  examQuestionCount: number
  reminder: {
    enabled: boolean
    timeLocal: string
    timezone: string
  } | null
}

export default function SettingsPage() {
  const { auth } = useTelegram()
  const [s, setS] = useState<Settings | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (auth.status !== 'authed') return
    fetch('/api/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) return
        setS({
          languageMode: d.user.languageMode,
          timezone: d.user.timezone,
          examQuestionCount: d.user.examQuestionCount,
          reminder: d.user.reminder,
        })
      })
  }, [auth.status])

  async function save() {
    if (!s) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/me/settings', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          languageMode: s.languageMode,
          timezone: s.timezone,
          examQuestionCount: s.examQuestionCount,
          reminderEnabled: s.reminder?.enabled ?? true,
          reminderTimeLocal: s.reminder?.timeLocal ?? '09:00',
          reminderTimezone: s.reminder?.timezone ?? s.timezone,
        }),
      })
      const d = await res.json()
      if (!res.ok || !d.ok) {
        alert(d.error || 'Ошибка')
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } finally {
      setSaving(false)
    }
  }

  if (auth.status !== 'authed') return <div className="p-6 text-tg-hint">Загрузка…</div>
  if (!s) return <div className="p-6 text-tg-hint">Загрузка настроек…</div>

  return (
    <div className="p-5 max-w-xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <a href="/app" className="text-tg-link text-sm">← Главная</a>
        <h1 className="text-lg font-semibold">Настройки</h1>
        <span />
      </div>

      <Section title="Язык отображения">
        <div className="grid gap-2">
          {([
            ['es_ru', 'Испанский + русский (рекомендуется)'],
            ['es_only', 'Только испанский'],
            ['ru_only', 'Только русский'],
          ] as const).map(([val, label]) => (
            <label
              key={val}
              className={`flex items-center justify-between px-3 py-2 rounded-xl bg-tg-secondary cursor-pointer ${
                s.languageMode === val ? 'ring-2 ring-tg-button' : ''
              }`}
            >
              <span className="text-sm">{label}</span>
              <input
                type="radio"
                name="lang"
                checked={s.languageMode === val}
                onChange={() => setS({ ...s, languageMode: val })}
              />
            </label>
          ))}
        </div>
      </Section>

      <Section title="Ежедневное напоминание">
        <label className="flex items-center justify-between px-3 py-2 rounded-xl bg-tg-secondary mb-2">
          <span className="text-sm">Включить напоминания</span>
          <input
            type="checkbox"
            checked={s.reminder?.enabled ?? true}
            onChange={(e) =>
              setS({
                ...s,
                reminder: {
                  enabled: e.target.checked,
                  timeLocal: s.reminder?.timeLocal ?? '09:00',
                  timezone: s.reminder?.timezone ?? s.timezone,
                },
              })
            }
          />
        </label>
        <label className="flex items-center justify-between px-3 py-2 rounded-xl bg-tg-secondary">
          <span className="text-sm">Время (местное)</span>
          <input
            type="time"
            value={s.reminder?.timeLocal ?? '09:00'}
            onChange={(e) =>
              setS({
                ...s,
                reminder: {
                  enabled: s.reminder?.enabled ?? true,
                  timeLocal: e.target.value,
                  timezone: s.reminder?.timezone ?? s.timezone,
                },
              })
            }
            className="bg-tg-bg border border-tg-hint/30 rounded px-2 py-1 text-sm"
          />
        </label>
      </Section>

      <Section title="Часовой пояс">
        <input
          value={s.timezone}
          onChange={(e) => setS({ ...s, timezone: e.target.value })}
          className="w-full bg-tg-secondary px-3 py-2 rounded-xl text-sm"
        />
        <p className="text-xs text-tg-hint mt-1">
          По умолчанию <code>America/Argentina/Buenos_Aires</code>
        </p>
      </Section>

      <Section title="Количество вопросов в экзамене">
        <input
          type="number"
          min={5}
          max={100}
          value={s.examQuestionCount}
          onChange={(e) => setS({ ...s, examQuestionCount: parseInt(e.target.value || '40', 10) })}
          className="w-full bg-tg-secondary px-3 py-2 rounded-xl text-sm"
        />
      </Section>

      <button
        onClick={save}
        disabled={saving}
        className="w-full px-4 py-3 rounded-xl bg-tg-button text-tg-buttonText font-semibold disabled:opacity-50 mt-3"
      >
        {saving ? 'Сохраняю…' : saved ? 'Сохранено ✓' : 'Сохранить'}
      </button>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h2 className="text-sm font-semibold mb-2 text-tg-hint uppercase tracking-wide">{title}</h2>
      {children}
    </section>
  )
}
