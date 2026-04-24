'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type AuthState =
  | { status: 'idle' }
  | { status: 'authenticating' }
  | { status: 'authed'; userId: string; firstName?: string | null }
  | { status: 'error'; error: string }

interface TelegramContextValue {
  auth: AuthState
  ready: boolean
  themeReady: boolean
}

const TelegramContext = createContext<TelegramContextValue>({
  auth: { status: 'idle' },
  ready: false,
  themeReady: false,
})

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready?: () => void
        expand?: () => void
        initData?: string
        initDataUnsafe?: unknown
        themeParams?: Record<string, string>
        colorScheme?: 'light' | 'dark'
        onEvent?: (name: string, cb: () => void) => void
        offEvent?: (name: string, cb: () => void) => void
      }
    }
  }
}

function applyTheme(params: Record<string, string> | undefined) {
  if (!params) return
  const root = document.documentElement
  const map: Record<string, string> = {
    bg_color: '--tg-bg',
    text_color: '--tg-text',
    hint_color: '--tg-hint',
    link_color: '--tg-link',
    button_color: '--tg-button',
    button_text_color: '--tg-button-text',
    secondary_bg_color: '--tg-secondary-bg',
  }
  for (const [k, v] of Object.entries(params)) {
    const css = map[k]
    if (css) root.style.setProperty(css, v)
  }
}

export default function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ status: 'idle' })
  const [ready, setReady] = useState(false)
  const [themeReady, setThemeReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function boot() {
      // Wait for telegram-web-app.js to load.
      for (let i = 0; i < 30; i++) {
        if (window.Telegram?.WebApp) break
        await new Promise((r) => setTimeout(r, 100))
      }
      const tg = window.Telegram?.WebApp
      if (tg?.ready) tg.ready()
      if (tg?.expand) tg.expand()

      applyTheme(tg?.themeParams)
      setThemeReady(true)

      const onTheme = () => applyTheme(tg?.themeParams)
      tg?.onEvent?.('themeChanged', onTheme)

      const initData = tg?.initData || ''
      setReady(true)

      if (!initData) {
        // Dev / out-of-Telegram mode.
        setAuth({ status: 'error', error: 'Откройте внутри Telegram.' })
        return
      }

      setAuth({ status: 'authenticating' })
      try {
        const res = await fetch('/api/auth/telegram', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ initData }),
        })
        const data = await res.json()
        if (!res.ok || !data.ok) {
          setAuth({ status: 'error', error: data.error || 'Auth failed' })
          return
        }
        if (cancelled) return
        setAuth({ status: 'authed', userId: data.user.id, firstName: data.user.firstName })
      } catch (e) {
        setAuth({ status: 'error', error: String(e) })
      }
    }

    boot()
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<TelegramContextValue>(
    () => ({ auth, ready, themeReady }),
    [auth, ready, themeReady],
  )

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>
}

export function useTelegram() {
  return useContext(TelegramContext)
}
