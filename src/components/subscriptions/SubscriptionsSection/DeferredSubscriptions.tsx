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
      // minHeight stays as a floor even after inView — the ssr:false body renders
      // nothing until its chunk downloads, so removing the floor collapses the
      // section to 0px and yanks the footer into the viewport (catastrophic CLS).
      // The floor only prevents shrinking; the body grows past it once rendered.
      style={{ width: '100%', alignSelf: 'stretch', minHeight: 640 }}
    >
      {inView && <SubscriptionsBody subscriptions={subscriptions} />}
    </div>
  )
}
