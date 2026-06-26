'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import useInView from '@/hooks/useInView'
import type { Subscription } from '@/entities/subscription'

// ssr:false → the body's JS chunk, images, DOM **and CSS** are NOT in the initial
// document or the LCP window; they mount only once the section nears the viewport.
// The placeholder imports NO SCSS module (that would pull its CSS back into the eager,
// render-blocking bundle) — only an inline min-height to reserve space.
//
// CLS fix: the minHeight floor stays after inView too, until the body has actually
// rendered. The ssr:false import renders nothing until its chunk downloads — without
// the floor the section collapses and yanks the footer into the viewport (CLS).
// Once the body renders, the floor is removed so there's no dead space.
const SubscriptionsBody = dynamic(() => import('./SubscriptionsBody'), { ssr: false })

export default function DeferredSubscriptions({ subscriptions }: { subscriptions: Subscription[] }) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const [contentReady, setContentReady] = useState(false)

  return (
    <div
      ref={ref}
      style={{ width: '100%', alignSelf: 'stretch', minHeight: contentReady ? undefined : 640 }}
    >
      {inView && (
        <div ref={(el) => { if (el && el.children.length > 0 && !contentReady) setContentReady(true) }}>
          <SubscriptionsBody subscriptions={subscriptions} />
        </div>
      )}
    </div>
  )
}
