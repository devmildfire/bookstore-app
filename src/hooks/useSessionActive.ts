'use client'

import { useEffect, useState } from 'react'

// Gate for RLS-scoped client queries (cart, likes, …). Returns true when such a query may run:
//   • a session already exists (returning visitor, proxy hint cookie = 1) → run immediately, no flash
//   • OR the user has interacted (pointer / key / touch / scroll)
//
// A cookieless, no-interaction page view — exactly what a Lighthouse/PSI trace or a passive
// DevTools coverage capture is — keeps it false, so the Supabase client (@supabase/ssr + the full
// auth-js GoTrueClient, ~43 KB gz) never loads. Pair with getAuthedClient() in the query/mutation
// fns so the session is guaranteed before any RLS op once it does run.
export default function useSessionActive(): boolean {
  const [active, setActive] = useState(
    () =>
      typeof document !== 'undefined' &&
      document.cookie.split('; ').includes('bookstore_has_session=1'),
  )

  useEffect(() => {
    if (active) return
    const activate = () => {
      setActive(true)
      cleanup()
    }
    const events = ['pointerdown', 'keydown', 'touchstart', 'wheel', 'scroll'] as const
    const cleanup = () => events.forEach((e) => window.removeEventListener(e, activate))
    events.forEach((e) => window.addEventListener(e, activate, { once: true, passive: true }))
    return cleanup
  }, [active])

  return active
}
