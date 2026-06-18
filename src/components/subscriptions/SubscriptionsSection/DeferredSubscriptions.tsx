'use client'

import dynamic from 'next/dynamic'
import useInView from '@/hooks/useInView'
import type { Subscription } from '@/entities/subscription'

// ssr:false → the body's JS chunk, images, DOM **and CSS** are NOT in the initial
// document or the LCP window; they mount only once the section nears the viewport.
// The placeholder imports NO SCSS module (that would pull its CSS back into the eager,
// render-blocking bundle) — only an inline min-height to reserve space.
const SubscriptionsBody = dynamic(() => import('./SubscriptionsBody'), { ssr: false })

export default function DeferredSubscriptions({ subscriptions }: { subscriptions: Subscription[] }) {
  const { ref, inView } = useInView<HTMLDivElement>()

  return (
    <div
      ref={ref}
      style={{ width: '100%', alignSelf: 'stretch', minHeight: inView ? undefined : 640 }}
    >
      {inView && <SubscriptionsBody subscriptions={subscriptions} />}
    </div>
  )
}
