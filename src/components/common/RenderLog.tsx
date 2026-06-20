'use client'

import { useEffect } from 'react'

// [TEMP DEBUG] Logs mount/unmount of whatever it's dropped into, on the same performance.now()
// clock as the [hero] Slider logs — so we can see exactly which page-tree change (Suspense
// fallback re-showing, catalog committing) coincides with the hero Slider unmounting/remounting.
export default function RenderLog({ tag }: { tag: string }) {
  useEffect(() => {
    console.log(`[hero] ${tag} MOUNT @${Math.round(performance.now())}ms`)
    return () => console.log(`[hero] ${tag} UNMOUNT @${Math.round(performance.now())}ms`)
  }, [tag])
  return null
}
